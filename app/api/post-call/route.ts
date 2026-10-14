// ============================================================
// app/api/post-call/route.ts
// POST /api/post-call
// Takes post-call notes, re-scores the lead, and drafts a
// WhatsApp follow-up message via Gemini.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { processPostCall } from "@/lib/ai";
import type { LeadFormData, LeadAnalysis } from "@/lib/types";

interface PostCallBody {
  form_data: LeadFormData;
  analysis: LeadAnalysis;
  call_notes: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PostCallBody = await req.json();

    if (!body.call_notes?.trim()) {
      return NextResponse.json({ error: "Call notes are required" }, { status: 400 });
    }
    if (!body.form_data || !body.analysis) {
      return NextResponse.json(
        { error: "Lead data and analysis are required" },
        { status: 400 }
      );
    }

    const update = await processPostCall(body.form_data, body.analysis, body.call_notes);
    return NextResponse.json(update);
  } catch (err) {
    console.error("[/api/post-call]", err);
    return NextResponse.json(
      { error: "Post-call update failed. Please try again." },
      { status: 500 }
    );
  }
}
