// ============================================================
// app/api/call-prep/route.ts
// POST /api/call-prep
// Accepts lead data + analysis; returns a CallBrief JSON with
// opening line, talking points, and objection handling pairs.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateCallBrief } from "@/lib/ai";
import type { LeadFormData, LeadAnalysis } from "@/lib/types";

interface CallPrepBody {
  form_data: LeadFormData;
  analysis: LeadAnalysis;
}

export async function POST(req: NextRequest) {
  try {
    const body: CallPrepBody = await req.json();

    if (!body.form_data || !body.analysis) {
      return NextResponse.json(
        { error: "Lead data and analysis are required" },
        { status: 400 }
      );
    }

    const brief = await generateCallBrief(body.form_data, body.analysis);
    return NextResponse.json(brief);
  } catch (err) {
    console.error("[/api/call-prep]", err);
    return NextResponse.json(
      { error: "Call prep generation failed. Please try again." },
      { status: 500 }
    );
  }
}
