"use client";
// ============================================================
// components/LeadCard.tsx
// Real Estate Lead Dossier Card.
// Scannable in ~3 seconds for busy brokers and sales reps:
// - Property Type & Location
// - Budget bracket & Timeline
// - AI Score & Priority
// - Instant Next Action directive
// ============================================================

import Link from "next/link";
import type { Lead } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { ScoreRing } from "./ScoreRing";

interface Props {
  lead: Lead;
}

export function LeadCard({ lead }: Props) {
  const { form_data: f, analysis: a } = lead;
  const timeAgo = getTimeAgo(lead.created_at);

  // Border accents by priority
  const borderLeft =
    a.priority === "hot"
      ? "border-l-red-500"
      : a.priority === "warm"
      ? "border-l-amber-500"
      : "border-l-sky-500";

  const topGlow =
    a.priority === "hot"
      ? "hover:border-red-200"
      : a.priority === "warm"
      ? "hover:border-amber-200"
      : "hover:border-sky-200";

  // Initials for avatar
  const initials = f.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/leads/${lead.id}`} className="block group">
      <div
        className={`estate-card bg-white rounded-2xl shadow-xs border border-slate-200/80 border-l-[6px] ${borderLeft} ${topGlow} p-5 relative overflow-hidden transition-all duration-200`}
      >
        {/* Top Meta Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Buyer Avatar */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-slate-700">
              {initials || "RE"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-emerald-700 transition-colors">
                  {f.name}
                </h3>
                <PriorityBadge priority={a.priority} size="sm" />
                {lead.post_call_update && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z" />
                    </svg>
                    Post-Call Logged
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-slate-700">{f.location}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{timeAgo}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <ScoreRing score={a.score} size={54} />
          </div>
        </div>

        {/* Real Estate Property Highlights Badges */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Budget
            </span>
            <span className="text-xs font-bold text-emerald-800 tracking-tight truncate block">
              💰 {f.budget}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Timeline
            </span>
            <span className="text-xs font-semibold text-slate-800 tracking-tight truncate block">
              ⏱️ {f.buying_timeline}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Property Spec
            </span>
            <span className="text-xs font-medium text-slate-800 truncate block">
              🏢 {f.property_requirement}
            </span>
          </div>
        </div>

        {/* Urgency Directive Banner */}
        <div className="mt-3 text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 text-amber-950 flex items-start gap-2">
          <span className="shrink-0 text-amber-600 font-bold">⚡ AI Triage:</span>
          <span className="font-medium line-clamp-1">{a.urgency_reason}</span>
        </div>

        {/* Requirements Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          {a.key_requirements.slice(0, 3).map((req, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-white text-slate-700 text-[11px] font-medium rounded-md border border-slate-200/90 shadow-2xs truncate max-w-[170px]"
            >
              ✓ {req}
            </span>
          ))}
          {a.key_requirements.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-md">
              +{a.key_requirements.length - 3} more
            </span>
          )}
        </div>

        {/* Card Footer: Next Action Directive & Link */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 truncate flex-1">
            <span className="font-semibold text-slate-900 shrink-0">👉 Action:</span>
            <span className="truncate text-slate-500">{a.next_action}</span>
          </div>
          <span className="shrink-0 font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Dossier & Coach
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
