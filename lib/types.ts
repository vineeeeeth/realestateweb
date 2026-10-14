// ============================================================
// lib/types.ts
// Central type definitions for the entire LeadPilot application.
// Having them in one place makes it easy to understand the data
// model at a glance and prevents type duplication across files.
// ============================================================

export type Priority = "hot" | "warm" | "cold";

// Raw form data submitted by the salesperson when adding a new lead
export interface LeadFormData {
  name: string;
  location: string;
  property_requirement: string;
  budget: string;
  buying_timeline: string;
  customer_message: string;
}

// The structured JSON the AI returns for every analysis
export interface LeadAnalysis {
  summary: string;
  intent: string;
  key_requirements: string[];
  objections: string[];
  next_action: string;
  suggested_response: string;
  score: number; // 0-100
  priority: Priority;
  urgency_reason: string;
}

// A single chat message in the per-lead assistant chat
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
}

// The call prep brief returned by the AI
export interface CallBrief {
  opening_line: string;
  talking_points: string[];
  likely_objections: Array<{ objection: string; suggested_answer: string }>;
}

// Post-call update: salesperson notes → AI re-scores and drafts WhatsApp
export interface PostCallUpdate {
  updated_score: number;
  updated_priority: Priority;
  whatsapp_draft: string;
  updated_urgency_reason: string;
}

// A fully persisted lead (stored in localStorage)
export interface Lead {
  id: string;
  created_at: string; // ISO 8601
  form_data: LeadFormData;
  analysis: LeadAnalysis;
  chat_history: ChatMessage[];
  call_brief: CallBrief | null;
  post_call_notes: string | null;
  post_call_update: PostCallUpdate | null;
}
