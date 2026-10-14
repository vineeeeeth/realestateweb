// ============================================================
// app/api/chat/route.ts
// POST /api/chat
// Per-lead follow-up chat. Accepts lead context + chat history +
// new user message; returns assistant reply as plain text.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { chatWithLead } from "@/lib/ai";
import type { LeadFormData, LeadAnalysis, ChatMessage } from "@/lib/types";

interface ChatRequestBody {
  lead: { form_data: LeadFormData; analysis: LeadAnalysis };
  chat_history: ChatMessage[];
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (!body.lead?.form_data || !body.lead?.analysis) {
      return NextResponse.json({ error: "Lead context is required" }, { status: 400 });
    }

    const reply = await chatWithLead(body.lead, body.chat_history, body.message);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
