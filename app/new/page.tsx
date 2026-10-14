"use client";
// ============================================================
// app/new/page.tsx (New Lead Intake Page)
// Two-column layout: Form on the left, Scoring Rubric on right.
// ============================================================

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import type { Lead } from "@/lib/types";

export default function NewLeadPage() {
  const router = useRouter();

  function handleSuccess(lead: Lead) {
    router.push(`/leads/${lead.id}`);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Pipeline
        </Link>
        <span>/</span>
        <span className="text-slate-900">New Property Lead Intake</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Main Form (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 md:p-8">
          <div className="mb-6 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                <span>🏢</span> Inbound Property Inquiry
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Capture & Score Inbound Lead
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter buyer specifications or WhatsApp inquiries. Gemini AI extracts intent, objections, and crafts an immediate response.
              </p>
            </div>
          </div>

          <LeadForm onSuccess={handleSuccess} />
        </div>

        {/* Right Col: AI Scoring Rubric & Best Practices (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Scoring Rubric Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span>🎯</span> AI Scoring Rubric
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              How Gemini Ranks Buyers
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Our model scores leads 0–100 using real-estate purchase signals:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300">Realistic, stated budget</span>
                <span className="text-emerald-400 font-bold">+20 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300">Urgent timeline (&lt;3 months)</span>
                <span className="text-emerald-400 font-bold">+20 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300">Specific micro-market named</span>
                <span className="text-emerald-400 font-bold">+20 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300">Clear property type & size</span>
                <span className="text-emerald-400 font-bold">+20 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300">Detailed, engaged message</span>
                <span className="text-emerald-400 font-bold">+20 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-red-300">
                <span>Vague / &quot;just browsing&quot;</span>
                <span className="font-bold">-15 pts</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-400 font-semibold">🔥 Hot: 70–100</span>
                <span className="text-amber-400 font-semibold">⚡ Warm: 40–69</span>
                <span className="text-sky-400 font-semibold">❄️ Cold: &lt;40</span>
              </div>
            </div>
          </div>

          {/* Broker Tip Card */}
          <div className="bg-amber-50/90 rounded-2xl p-5 border border-amber-200/80 text-amber-900 text-xs">
            <div className="font-bold uppercase tracking-wider text-[11px] text-amber-800 mb-1 flex items-center gap-1.5">
              <span>💡</span> Broker Triage Tip
            </div>
            <p className="leading-relaxed text-amber-950">
              Paste raw WhatsApp conversation transcripts directly into the customer message box. The AI will extract the buyer&apos;s true budget ceiling and timeline automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
