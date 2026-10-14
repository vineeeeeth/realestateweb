"use client";
// ============================================================
// app/page.tsx (Home — Real Estate Lead Pipeline Dashboard)
// Displays incoming real estate buyer leads sorted by AI score.
// Features:
//   - Pipeline Summary Metric Cards (Hot, Warm, Cold, Avg Score)
//   - Real-time search by Buyer Name, Locality or Property spec
//   - Priority Filter Tabs
//   - Responsive 2-column LeadCard grid
//   - Auto-seeds realistic sample leads on first open
// ============================================================

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getLeads, seedIfEmpty } from "@/lib/storage";
import { SEED_LEADS } from "@/lib/seeds";
import { LeadCard } from "@/components/LeadCard";
import type { Lead, Priority } from "@/lib/types";

type Filter = "all" | Priority;

const FILTER_TABS: { value: Filter; label: string; icon: string }[] = [
  { value: "all", label: "All Pipeline", icon: "🏢" },
  { value: "hot", label: "Hot Closures", icon: "🔥" },
  { value: "warm", label: "Warm Leads", icon: "⚡" },
  { value: "cold", label: "Cold / Nurture", icon: "❄️" },
];

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Seed sample leads if local storage is fresh
    seedIfEmpty(SEED_LEADS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeads(getLeads());
    setMounted(true);
  }, []);

  // Filtered and searched leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter =
        filter === "all" || lead.analysis.priority === filter;
      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const name = lead.form_data.name.toLowerCase();
      const loc = lead.form_data.location.toLowerCase();
      const prop = lead.form_data.property_requirement.toLowerCase();
      const budget = lead.form_data.budget.toLowerCase();

      return (
        name.includes(q) ||
        loc.includes(q) ||
        prop.includes(q) ||
        budget.includes(q)
      );
    });
  }, [leads, filter, searchQuery]);

  // Aggregate stats
  const counts = {
    all: leads.length,
    hot: leads.filter((l) => l.analysis.priority === "hot").length,
    warm: leads.filter((l) => l.analysis.priority === "warm").length,
    cold: leads.filter((l) => l.analysis.priority === "cold").length,
  };

  const avgScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((acc, curr) => acc + curr.analysis.score, 0) /
            leads.length
        )
      : 0;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <svg
          className="animate-spin h-8 w-8 text-emerald-600 mb-3"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm font-medium">Loading property pipeline…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real Estate Pipeline Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Broker CRM Dashboard
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Live AI Lead Triage
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Real Estate Inbound Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritise high-intent buyers, review AI call briefs, and dispatch instant WhatsApp pitches.
          </p>
        </div>

        <Link
          href="/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-emerald-500 hover:to-slate-800 transition-all shrink-0"
        >
          <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add New Buyer Lead
        </Link>
      </div>

      {/* Real Estate Metric Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inquiries
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
              🏢
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{counts.all}</span>
            <span className="text-xs text-slate-500">active buyers</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Tracked in local storage
          </p>
        </div>

        {/* Hot Leads */}
        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-4 border border-red-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Hot Closures
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">
              🔥
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{counts.hot}</span>
            <span className="text-xs text-red-600/80 font-medium">ready to close</span>
          </div>
          <p className="text-[11px] text-red-500 mt-1 truncate">
            Urgent timeline & pre-approved
          </p>
        </div>

        {/* Warm Pipeline */}
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Active Nurturing
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm">
              ⚡
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{counts.warm}</span>
            <span className="text-xs text-amber-600 font-medium">evaluating units</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1 truncate">
            Need site visits & follow-ups
          </p>
        </div>

        {/* Average Match Score */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Avg Deal Quality
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">
              🎯
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{avgScore}</span>
            <span className="text-xs text-emerald-600 font-medium">/ 100 points</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 truncate">
            Gemini AI qualification rating
          </p>
        </div>
      </div>

      {/* Search Bar & Priority Filter Controls */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by buyer name, locality (e.g. Bandra, Koramangala), or budget..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.value;
            const count = counts[tab.value];
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Real Estate Lead Cards */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl mb-4 border border-emerald-100">
            🏡
          </div>
          {leads.length === 0 ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Your Property Pipeline is Empty
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Receive and score inbound buyers from 99acres, MagicBricks, WhatsApp or direct walk-ins with AI precision.
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-all"
              >
                + Add First Buyer Inquiry
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No matching leads found
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                No inquiries matched your search query &quot;{searchQuery}&quot; or the active filter.
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Reset filters & search
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
