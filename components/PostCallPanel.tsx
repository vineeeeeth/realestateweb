"use client";
// ============================================================
// components/PostCallPanel.tsx
// Real Estate Post-Call Triage & WhatsApp Dispatch.
// Re-scores buyer intent based on salesperson call notes
// and generates a ready-to-send WhatsApp confirmation.
// ============================================================

import { useState } from "react";
import type { Lead, PostCallUpdate } from "@/lib/types";
import { updateLead } from "@/lib/storage";
import { CopyButton } from "./CopyButton";
import { PriorityBadge } from "./PriorityBadge";
import { ScoreRing } from "./ScoreRing";

interface Props {
  lead: Lead;
  onUpdate: (updated: Lead) => void;
}

const SAMPLE_CALL_NOTES = [
  "Spoke for 15 mins. Confirmed pre-approved budget at ₹3.8 Cr. Agreed to visit 2 units this Saturday at 11:30 AM with spouse. Very keen on sea-facing view.",
  "Buyer says budget is stretched beyond ₹1 Cr. Wants to wait 6 months for upcoming new phase launch. Not ready for site visit.",
];

export function PostCallPanel({ lead, onUpdate }: Props) {
  const [notes, setNotes] = useState(lead.post_call_notes ?? "");
  const [result, setResult] = useState<PostCallUpdate | null>(
    lead.post_call_update
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPostCall() {
    if (!notes.trim()) {
      setError("Please enter your call notes before submitting");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/post-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_data: lead.form_data,
          analysis: lead.analysis,
          call_notes: notes,
        }),
      });

      const data: PostCallUpdate = await res.json();
      if (!res.ok)
        throw new Error((data as { error?: string }).error || "Failed to process call notes");

      setResult(data);

      const updated = updateLead(lead.id, {
        post_call_notes: notes,
        post_call_update: data,
        analysis: {
          ...lead.analysis,
          score: data.updated_score,
          priority: data.updated_priority,
          urgency_reason: data.updated_urgency_reason,
        },
      });
      if (updated) onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Generate WhatsApp web link
  const whatsappUrl = result?.whatsapp_draft
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        result.whatsapp_draft
      )}`
    : "#";

  return (
    <div className="space-y-6">
      {/* Quick Notes Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Broker Call Debrief & Outcome *
          </label>
          <span className="text-[11px] text-slate-400">
            AI incorporates notes into updated score & follow-up
          </span>
        </div>

        <textarea
          rows={4}
          className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
          placeholder="e.g. Spoke for 10 mins. Buyer confirmed pre-approved budget. Scheduled physical site visit for Saturday at 11 AM. Needs 2 covered parking spots..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
        />

        {/* Quick sample chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Quick test notes:</span>
          {SAMPLE_CALL_NOTES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setNotes(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors truncate max-w-xs"
            >
              📝 {sample.slice(0, 38)}…
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={submitPostCall}
        disabled={loading || !notes.trim()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white font-bold text-sm hover:from-emerald-500 hover:to-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Re-Evaluating Lead & Drafting WhatsApp…</span>
          </>
        ) : result ? (
          <>
            <span>↻</span>
            <span>Re-evaluate with New Call Notes</span>
          </>
        ) : (
          <>
            <span>🔄</span>
            <span>Update Lead Score & Generate WhatsApp Follow-Up</span>
          </>
        )}
      </button>

      {/* Result Display */}
      {result && (
        <div className="space-y-5 pt-3 border-t border-slate-200">
          {/* Before & After Score Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <span>📊</span> AI Re-Scoring Impact
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Pre-Call
                  </span>
                  <ScoreRing score={lead.analysis.score} size={54} />
                </div>

                <div className="text-slate-600 text-xl font-bold">→</div>

                <div className="text-center">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Post-Call
                  </span>
                  <ScoreRing score={result.updated_score} size={54} />
                </div>

                <div className="pl-3 border-l border-slate-800">
                  <PriorityBadge priority={result.updated_priority} size="md" />
                  <p className="text-xs text-slate-300 mt-1.5 font-medium leading-snug">
                    {result.updated_urgency_reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                  💬
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Drafted WhatsApp Follow-Up
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Concise, conversational, and tailored to call commitments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton text={result.whatsapp_draft} label="Copy Message" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <span>Launch WhatsApp</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 text-sm text-slate-800 leading-relaxed font-sans shadow-2xs whitespace-pre-wrap">
              {result.whatsapp_draft}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
