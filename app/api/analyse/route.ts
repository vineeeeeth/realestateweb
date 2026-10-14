// ============================================================
// app/api/analyse/route.ts
// POST /api/analyse
// Accepts LeadFormData, calls the AI, returns LeadAnalysis JSON.
// This is the ONLY place that touches the GEMINI_API_KEY.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyseLead } from "@/lib/ai";
import type { LeadFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: LeadFormData = await req.json();

    // Basic server-side validation — belt and suspenders on top of
    // the client-side validation in the form component.
    const required: (keyof LeadFormData)[] = [
      "name",
      "location",
      "property_requirement",
      "budget",
      "buying_timeline",
      "customer_message",
    ];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Field "${field}" is required` },
          { status: 400 }
        );
      }
    }

    const analysis = await analyseLead(body);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[/api/analyse]", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
