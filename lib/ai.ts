// ============================================================
// lib/ai.ts
// ALL Gemini AI calls live here — zero AI logic anywhere else.
// This makes it trivial to swap models, tweak prompts, or add
// retries without hunting through multiple files.
//
// Pattern: each exported function builds a prompt, calls the
// Gemini API, parses + validates JSON, and retries once on bad
// output before throwing a user-friendly error.
// ============================================================

import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
  type GenerationConfig,
} from "@google/generative-ai";
import type {
  LeadFormData,
  LeadAnalysis,
  ChatMessage,
  CallBrief,
  PostCallUpdate,
} from "./types";

// --- Initialise the client once (server-side only) ------------
// The API key is read from an environment variable and is NEVER
// sent to the browser. All calls go through Next.js API routes.
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default to gemini-3.5-flash-lite for speed & active API compatibility
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// ---------------------------------------------------------------
// Helper: call the model with JSON mode and retry once on failure
// ---------------------------------------------------------------
async function callWithJsonRetry<T>(
  prompt: string,
  responseSchema: Schema,
  systemInstruction: string
): Promise<T> {
  const generationConfig: GenerationConfig = {
    responseMimeType: "application/json",
    responseSchema,
  };

  async function attempt(): Promise<T> {
    const model = genai.getGenerativeModel({
      model: MODEL,
      systemInstruction,
      generationConfig,
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Even with JSON mode, always validate — belt and suspenders.
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Model returned invalid JSON: ${text.slice(0, 200)}`);
    }
  }

  try {
    return await attempt();
  } catch (err) {
    // Retry once before giving up
    console.warn("AI call failed on first attempt, retrying:", err);
    return await attempt();
  }
}

// ---------------------------------------------------------------
// 1. LEAD ANALYSIS
// Analyses a new lead and returns a structured LeadAnalysis.
// The scoring rubric is embedded in the system instruction so
// it can be tuned independently of the user-facing prompt.
// ---------------------------------------------------------------

const ANALYSIS_SYSTEM = `You are an expert real-estate sales analyst.
Analyse inbound leads and return STRICT JSON matching the provided schema.

SCORING RUBRIC (score 0-100):
+20  Clear, realistic budget mentioned
+20  Short buying timeline (< 3 months)
+20  Specific location or neighbourhood named
+20  Specific property type / size / features mentioned
+20  Engaged, detailed customer message (>40 words, shows genuine intent)

Deductions:
-15  Vague or "just browsing" messages
-10  No budget given
-10  Timeline > 12 months or not mentioned
-10  Location is very broad (e.g. "somewhere in the city")

Derive priority from score:
  70-100 → "hot"
  40-69  → "warm"
  0-39   → "cold"

Always respond with JSON only. Never add prose outside the JSON.`;

const ANALYSIS_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    intent: { type: SchemaType.STRING },
    key_requirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    objections: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    next_action: { type: SchemaType.STRING },
    suggested_response: { type: SchemaType.STRING },
    score: { type: SchemaType.INTEGER },
    priority: { type: SchemaType.STRING, format: "enum", enum: ["hot", "warm", "cold"] },
    urgency_reason: { type: SchemaType.STRING },
  },
  required: [
    "summary",
    "intent",
    "key_requirements",
    "objections",
    "next_action",
    "suggested_response",
    "score",
    "priority",
    "urgency_reason",
  ],
};

export async function analyseLead(form: LeadFormData): Promise<LeadAnalysis> {
  const prompt = `
LEAD DETAILS:
Name: ${form.name}
Location: ${form.location}
Property Requirement: ${form.property_requirement}
Budget: ${form.budget}
Buying Timeline: ${form.buying_timeline}
Customer Message: """
${form.customer_message}
"""

Analyse this lead and return JSON.`;

  return callWithJsonRetry<LeadAnalysis>(prompt, ANALYSIS_SCHEMA, ANALYSIS_SYSTEM);
}

// ---------------------------------------------------------------
// 2. PER-LEAD CHAT
// The system prompt locks the model strictly to this lead's
// context so it can't hallucinate information about other leads.
// Uses the chat API (startChat) so history is maintained.
// ---------------------------------------------------------------

export async function chatWithLead(
  lead: { form_data: LeadFormData; analysis: LeadAnalysis },
  chatHistory: ChatMessage[],
  userMessage: string
): Promise<string> {
  const model = genai.getGenerativeModel({
    model: MODEL,
    systemInstruction: `You are a real-estate sales coach helping a salesperson handle ONE specific lead.
You ONLY answer questions about this lead. Refuse politely if asked about anything unrelated.
Be concise, practical, and assertive. Use bullet points when listing.

LEAD CONTEXT:
Name: ${lead.form_data.name}
Location: ${lead.form_data.location}
Property: ${lead.form_data.property_requirement}
Budget: ${lead.form_data.budget}
Timeline: ${lead.form_data.buying_timeline}
Message: "${lead.form_data.customer_message}"

AI ANALYSIS:
Score: ${lead.analysis.score}/100 (${lead.analysis.priority})
Summary: ${lead.analysis.summary}
Intent: ${lead.analysis.intent}
Key Requirements: ${lead.analysis.key_requirements.join(", ")}
Objections: ${lead.analysis.objections.join(", ")}
Next Action: ${lead.analysis.next_action}`,
  });

  // Build history in the format the Gemini SDK expects.
  // Note: history passed to startChat does NOT include the latest message —
  // that is sent separately via sendMessage below.
  const chat = model.startChat({
    history: chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// ---------------------------------------------------------------
// 3. CALL PREP BRIEF
// Generates a one-page brief: opening line, talking points, and
// objection handling pairs. Returns structured JSON.
// ---------------------------------------------------------------

const CALL_BRIEF_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    opening_line: { type: SchemaType.STRING },
    talking_points: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    likely_objections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          objection: { type: SchemaType.STRING },
          suggested_answer: { type: SchemaType.STRING },
        },
        required: ["objection", "suggested_answer"],
      },
    },
  },
  required: ["opening_line", "talking_points", "likely_objections"],
};

const CALL_BRIEF_SYSTEM = `You are a real-estate sales coach. 
Generate a concise call preparation brief for a salesperson.
Keep it scannable — short bullets, powerful opening line.
Return JSON only.`;

export async function generateCallBrief(
  form: LeadFormData,
  analysis: LeadAnalysis
): Promise<CallBrief> {
  const prompt = `
Generate a call prep brief for this lead:
Name: ${form.name}
Location: ${form.location}
Property: ${form.property_requirement}
Budget: ${form.budget}
Timeline: ${form.buying_timeline}
Message: "${form.customer_message}"

Analysis:
Score: ${analysis.score}/100 (${analysis.priority})
Summary: ${analysis.summary}
Key Requirements: ${analysis.key_requirements.join(", ")}
Objections: ${analysis.objections.join(", ")}

Return a JSON call prep brief with opening_line, talking_points[], and likely_objections[{objection, suggested_answer}].`;

  return callWithJsonRetry<CallBrief>(prompt, CALL_BRIEF_SCHEMA, CALL_BRIEF_SYSTEM);
}

// ---------------------------------------------------------------
// 4. POST-CALL UPDATE
// Takes salesperson notes, re-scores the lead, and drafts a
// WhatsApp follow-up message.
// Key: the WhatsApp draft is conversational and short —
// people don't read long WhatsApp messages.
// ---------------------------------------------------------------

const POST_CALL_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    updated_score: { type: SchemaType.INTEGER },
    updated_priority: { type: SchemaType.STRING, format: "enum", enum: ["hot", "warm", "cold"] },
    whatsapp_draft: { type: SchemaType.STRING },
    updated_urgency_reason: { type: SchemaType.STRING },
  },
  required: [
    "updated_score",
    "updated_priority",
    "whatsapp_draft",
    "updated_urgency_reason",
  ],
};

const POST_CALL_SYSTEM = `You are a real-estate sales analyst.
Re-score a lead based on post-call notes and draft a short WhatsApp follow-up.
The WhatsApp message must be friendly, under 100 words, conversational, and have a clear CTA.
Apply the same scoring rubric as before but incorporate what was learned on the call.

SCORING RUBRIC (score 0-100):
+20  Clear, realistic budget confirmed on call
+20  Short buying timeline (< 3 months)
+20  Specific location or neighbourhood confirmed
+20  Specific property type / size / features confirmed
+20  Engaged, showed clear intent on call

Deductions:
-15  Still vague or uncommitted after call
-10  Budget unclear or budget mismatch
-10  Long or uncertain timeline
-10  Location still very broad

Return JSON only.`;

export async function processPostCall(
  form: LeadFormData,
  originalAnalysis: LeadAnalysis,
  callNotes: string
): Promise<PostCallUpdate> {
  const prompt = `
Original Lead:
Name: ${form.name}
Budget: ${form.budget}
Timeline: ${form.buying_timeline}
Property: ${form.property_requirement}
Location: ${form.location}

Original Score: ${originalAnalysis.score}/100 (${originalAnalysis.priority})
Original Intent: ${originalAnalysis.intent}

Post-Call Notes from Salesperson:
"""
${callNotes}
"""

Re-score the lead based on this new information and draft a WhatsApp follow-up message.`;

  return callWithJsonRetry<PostCallUpdate>(
    prompt,
    POST_CALL_SCHEMA,
    POST_CALL_SYSTEM
  );
}
