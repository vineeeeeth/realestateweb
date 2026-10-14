"use client";
// ============================================================
// app/leads/[id]/page.tsx (Lead Deal Dossier Command Center)
// Executive workspace for brokers and real estate sales reps.
// Features 4 tabs:
//   1. Deal Dossier  — AI analysis, requirements, objections, suggested response
//   2. AI Deal Coach — context-locked sales coach chat
//   3. Call Brief    — opening hook, talking points, counter-pitches
//   4. Post-Call Log — debrief notes, instant re-scoring, WhatsApp follow-up
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getLeadById } from "@/lib/storage";
import type { Lead } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ScoreRing } from "@/components/ScoreRing";
import { CopyButton } from "@/components/CopyButton";
import { ChatPanel } from "@/components/ChatPanel";
import { CallPrepPanel } from "@/components/CallPrepPanel";
import { PostCallPanel } from "@/components/PostCallPanel";

type Tab = "overview" | "chat" | "callprep" | "postcall";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Deal Dossier", icon: "📋" },
  { id: "chat", label: "AI Deal Coach", icon: "💬" },
  { id: "callprep", label: "Call Prep Brief", icon: "📞" },
  { id: "postcall", label: "Post-Call & WhatsApp", icon: "📝" },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const found = getLeadById(params.id as string);
    if (!found) {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLead(found);
    setMounted(true);
  }, [params.id, router]);

  if (!mounted || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <svg className="animate-spin h-8 w-8 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Loading lead dossier…</span>
      </div>
    );
  }

  const { form_data: f, analysis: a } = lead;

  const initials = f.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Pipeline
          </Link>
          <span>/</span>
          <span className="text-slate-900">{f.name}</span>
        </div>
        <Link
          href="/new"
          className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
        >
          <span>+</span> New Lead
        </Link>
      </div>

      {/* Executive Real Estate Lead Dossier Header */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Buyer Monogram Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-amber-300 font-extrabold text-lg flex items-center justify-center shrink-0 border border-slate-700 shadow-sm">
              {initials || "RE"}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {f.name}
                </h1>
                <PriorityBadge priority={a.priority} size="md" showTag />
                {lead.post_call_update && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    <span>📞</span> Post-Call Logged
                  </span>
                )}
              </div>

              {/* Property Specs Ribbon */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-600 mt-2">
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <span>🏢</span> {f.property_requirement}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <span>💰</span> {f.budget}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <span>📍</span> {f.location}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-amber-900 font-semibold">
                  <span>⏱️</span> {f.buying_timeline}
                </span>
              </div>
            </div>
          </div>

          {/* AI Score Radial Indicator */}
          <div className="flex items-center gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 self-start lg:self-auto shrink-0">
            <ScoreRing score={a.score} size={64} showLabel />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                AI Match Score
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 max-w-[150px] leading-tight">
                {a.urgency_reason}
              </p>
            </div>
          </div>
        </div>

        {/* AI Deal Summary Callout */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/30 border border-emerald-100 flex items-start gap-3">
          <span className="text-base">💡</span>
          <div>
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
              Deal Synopsis
            </span>
            <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed mt-0.5">
              {a.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation Ribbon */}
      <div className="flex gap-2 bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto shadow-2xs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <OverviewTab lead={lead} onOpenChat={() => setActiveTab("chat")} onOpenCall={() => setActiveTab("callprep")} />
      )}

      {activeTab === "chat" && (
        <div
          className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col"
          style={{ height: "640px" }}
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 font-bold flex items-center justify-center text-sm border border-slate-700">
                AI
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-sm">
                  Real Estate Deal Coach
                </h2>
                <p className="text-[11px] text-slate-400">
                  Negotiation strategist exclusively locked to {f.name}&apos;s profile
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Active Session
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel lead={lead} onUpdate={setLead} />
          </div>
        </div>
      )}

      {activeTab === "callprep" && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <span>📞</span> Pitch & Objection Briefing
            </div>
            <h2 className="text-xl font-black text-slate-900">
              One-Page Call Preparation Brief
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review before dialing {f.name} to maximize site-visit conversions.
            </p>
          </div>
          <CallPrepPanel lead={lead} onUpdate={setLead} />
        </div>
      )}

      {activeTab === "postcall" && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">
              <span>📝</span> Post-Call Assessment
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Post-Call Log & WhatsApp Dispatch
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter feedback from your phone call. AI updates lead temperature and drafts WhatsApp follow-up.
            </p>
          </div>
          <PostCallPanel lead={lead} onUpdate={setLead} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Deal Dossier Overview Tab Component
// ---------------------------------------------------------------
function OverviewTab({
  lead,
  onOpenChat,
  onOpenCall,
}: {
  lead: Lead;
  onOpenChat: () => void;
  onOpenCall: () => void;
}) {
  const { form_data: f, analysis: a } = lead;

  const whatsappResponseUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    a.suggested_response
  )}`;

  return (
    <div className="space-y-6">
      {/* Action Directive & Intent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Action Directive */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🎯</span> Recommended Broker Action
            </div>
            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {a.next_action}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on buyer urgency ({f.buying_timeline}) and budget alignment ({f.budget}).
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3">
            <button
              onClick={onOpenCall}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
            >
              📞 Open Call Prep
            </button>
            <button
              onClick={onOpenChat}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              💬 Ask AI Coach
            </button>
          </div>
        </div>

        {/* Buyer Intent Analysis */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🔍</span> Buyer Intent Profile
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
              {a.intent}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identified from inquiry message phrasing, timeframe commitment, and micro-market specificity.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Priority Tier:</span>
            <PriorityBadge priority={a.priority} size="sm" />
          </div>
        </div>
      </div>

      {/* Two-column: Requirements + Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Requirements */}
        <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/90 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              Buyer Requirements Checklist
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {a.key_requirements.length} criteria
            </span>
          </div>
          <ul className="space-y-2.5">
            {a.key_requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 text-xs text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential Objections */}
        <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/90 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                ⚠️
              </span>
              Potential Objections & Risk Factors
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {a.objections.length} flagged
            </span>
          </div>
          <ul className="space-y-2.5">
            {a.objections.length > 0 ? (
              a.objections.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-slate-800 font-medium bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic py-4 text-center">
                No critical friction points detected for this lead.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Ready-to-Send Suggested Pitch / Response */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/30 rounded-3xl shadow-2xs border border-emerald-200/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>💌</span> Instant AI Property Pitch
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Personalized initial reply tailored to {f.name}&apos;s specific specifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton text={a.suggested_response} label="Copy Pitch" />
            <a
              href={whatsappResponseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <span>Send via WhatsApp</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-sm text-slate-800 leading-relaxed shadow-2xs whitespace-pre-wrap">
          {a.suggested_response}
        </div>
      </div>

      {/* Raw Customer Message Transcript */}
      <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/90 p-6">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>💬</span> Inbound Customer Inquiry Text
        </h3>
        <blockquote className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic leading-relaxed">
          &ldquo;{f.customer_message}&rdquo;
        </blockquote>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Property Type</span>
            <span className="font-semibold text-slate-800">{f.property_requirement}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Stated Budget</span>
            <span className="font-semibold text-slate-800">{f.budget}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Horizon</span>
            <span className="font-semibold text-slate-800">{f.buying_timeline}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Locality</span>
            <span className="font-semibold text-slate-800">{f.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
