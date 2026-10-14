"use client";
// ============================================================
// components/CallPrepPanel.tsx
// Real Estate Phone Call Prep Briefing.
// Provides the salesperson with an instant opening hook,
// key pitch points, and objection responses.
// ============================================================

import { useState } from "react";
import type { Lead, CallBrief } from "@/lib/types";
import { updateLead } from "@/lib/storage";
import { CopyButton } from "./CopyButton";

interface Props {
  lead: Lead;
  onUpdate: (updated: Lead) => void;
}

export function CallPrepPanel({ lead, onUpdate }: Props) {
  const [brief, setBrief] = useState<CallBrief | null>(lead.call_brief);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateBrief() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/call-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_data: lead.form_data,
          analysis: lead.analysis,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Call prep generation failed");

      setBrief(data);
      const updated = updateLead(lead.id, { call_brief: data });
      if (updated) onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!brief) {
    return (
      <div className="text-center py-12 px-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-100">
          📞
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Prepare Your Sales Pitch Call
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Generate an executive one-page briefing with an irresistible opening line, structured talking points, and battle-tested objection handling for {lead.form_data.name}.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={generateBrief}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white font-bold text-sm hover:from-emerald-500 hover:to-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Analyzing Property Data & Briefing…</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Call Brief for {lead.form_data.name}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Buyer Quick Spec Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">Target Buyer:</span>
          <span>{lead.form_data.name}</span>
          <span className="text-slate-300">·</span>
          <span>Budget: {lead.form_data.budget}</span>
        </div>
        <button
          onClick={generateBrief}
          disabled={loading}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
        >
          <span>↻</span> {loading ? "Regenerating…" : "Regenerate Brief"}
        </button>
      </div>

      {/* Opening Hook Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 border border-emerald-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              Opening Conversation Hook
            </h4>
          </div>
          <CopyButton text={brief.opening_line} label="Copy Hook" />
        </div>
        <p className="text-slate-900 font-semibold text-base leading-relaxed pl-8 italic">
          &ldquo;{brief.opening_line}&rdquo;
        </p>
      </div>

      {/* Structured Talking Points */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center text-xs font-bold">
            2
          </span>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            High-Impact Talking Points (Follow in Sequence)
          </h4>
        </div>
        <div className="space-y-3">
          {brief.talking_points.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Objection Handling Playbook */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Objection Defense & Counter-Pitches
          </h4>
        </div>
        <div className="space-y-4">
          {brief.likely_objections.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="bg-red-50/80 px-4 py-2.5 text-xs font-bold text-red-900 border-b border-red-100 flex items-center gap-2">
                <span className="text-red-600">❌ Anticipated Buyer Hesitation:</span>
                <span>{item.objection}</span>
              </div>
              <div className="bg-emerald-50/50 px-4 py-3 text-sm text-emerald-950 font-medium leading-relaxed flex items-start gap-2">
                <span className="text-emerald-700 shrink-0 font-bold">✅ Counter Pitch:</span>
                <span>{item.suggested_answer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
