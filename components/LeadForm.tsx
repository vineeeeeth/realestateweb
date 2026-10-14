"use client";
// ============================================================
// components/LeadForm.tsx
// Real Estate Buyer Intake & AI Qualification Form.
// Features:
//   - Quick sample auto-fill for instant testing
//   - Property requirement & timeline quick chips
//   - Interactive Real Estate qualification progress state
//   - Rigorous client-side & server-side validation
// ============================================================

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveLead } from "@/lib/storage";
import type { LeadFormData, Lead } from "@/lib/types";

interface Props {
  onSuccess: (lead: Lead) => void;
}

const EMPTY_FORM: LeadFormData = {
  name: "",
  location: "",
  property_requirement: "",
  budget: "",
  buying_timeline: "",
  customer_message: "",
};

const SAMPLE_BUYERS: { label: string; data: LeadFormData }[] = [
  {
    label: "🔥 Hot Relocating Buyer (₹3.5 Cr)",
    data: {
      name: "Vikram Singhania",
      location: "Indiranagar / Koramangala, Bengaluru",
      property_requirement: "3BHK or 4BHK Penthouse, 2000+ sq ft with terrace & 2 car parks",
      budget: "₹3.5–4.2 Cr",
      buying_timeline: "Immediate (within 3 weeks)",
      customer_message:
        "We are relocating from Singapore by month-end. Have pre-approved HDFC loan ready for 3.5 Cr. Need a modern high-rise with club amenities and power backup. Looking to visit properties this Thursday or Friday.",
    },
  },
  {
    label: "⚡ Warm Family Upgrader (₹1.8 Cr)",
    data: {
      name: "Ananya & Rohan Deshmukh",
      location: "Powai / Kanjurmarg, Mumbai",
      property_requirement: "3BHK Lake-view flat in a reputed gated society",
      budget: "₹1.8–2.1 Cr",
      buying_timeline: "Within 2 to 3 months",
      customer_message:
        "Looking to upgrade from our 2BHK. Need good schools nearby for our 6-year old daughter. We have seen a few projects in Powai but prices are on the higher side. Open to under-construction if possession is by Diwali.",
    },
  },
];

const PROPERTY_PRESETS = [
  "3BHK Luxury High-Rise",
  "4BHK Gated Villa",
  "Penthouse with Private Terrace",
  "2BHK Gated Community",
  "Commercial Office Space",
];

const TIMELINE_PRESETS = [
  "Immediate (< 30 days)",
  "1 to 3 months",
  "3 to 6 months",
  "Exploring / 6+ months",
];

const BUDGET_PRESETS = [
  "₹60L – ₹95L",
  "₹1.2 Cr – ₹1.8 Cr",
  "₹2.5 Cr – ₹3.5 Cr",
  "₹4 Cr – ₹7 Cr+",
];

export function LeadForm({ onSuccess }: Props) {
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: Partial<LeadFormData> = {};
    if (!form.name.trim()) newErrors.name = "Buyer name is required";
    if (!form.location.trim()) newErrors.location = "Target location is required";
    if (!form.property_requirement.trim())
      newErrors.property_requirement = "Property type/spec is required";
    if (!form.budget.trim()) newErrors.budget = "Budget range is required";
    if (!form.buying_timeline.trim())
      newErrors.buying_timeline = "Buying timeline is required";
    if (!form.customer_message.trim())
      newErrors.customer_message = "Inquiry message is required";
    if (form.customer_message.trim().length < 10)
      newErrors.customer_message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    setLoadingStep(1);

    const stepTimer = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const newLead: Lead = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        form_data: form,
        analysis: data,
        chat_history: [],
        call_brief: null,
        post_call_notes: null,
        post_call_update: null,
      };

      saveLead(newLead);
      setForm(EMPTY_FORM);
      clearInterval(stepTimer);
      onSuccess(newLead);
    } catch (err) {
      clearInterval(stepTimer);
      setApiError(err instanceof Error ? err.message : "Something went wrong during analysis");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  }

  function handleAutoFill(sampleData: LeadFormData) {
    setForm(sampleData);
    setErrors({});
    setApiError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sample Lead Quick-Fill bar */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
            <span>⚡</span> One-Click Test Presets
          </span>
          <span className="text-[11px] text-amber-700">Auto-populates realistic buyer inquiries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_BUYERS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAutoFill(sample.data)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-amber-300 hover:border-amber-400 hover:bg-amber-100/50 transition-all shadow-2xs"
            >
              {sample.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setForm(EMPTY_FORM)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-all ml-auto"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Row 1: Buyer Name & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Buyer Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
            <input
              id="name"
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 ${
                errors.name ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Target Locality / Micro-Market *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
            <input
              id="location"
              type="text"
              placeholder="e.g. Bandra West, Mumbai or HSR Layout"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={loading}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 ${
                errors.location ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
              }`}
            />
          </div>
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
        </div>
      </div>

      {/* Row 2: Property Requirement with Quick Pills */}
      <div>
        <label htmlFor="property_requirement" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Property Requirement & Specifications *
        </label>
        <div className="relative mb-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🏢</span>
          <input
            id="property_requirement"
            type="text"
            placeholder="e.g. 3BHK flat, sea-facing, 1400+ sq ft with 2 parking spots"
            value={form.property_requirement}
            onChange={(e) => setForm({ ...form, property_requirement: e.target.value })}
            disabled={loading}
            className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 ${
              errors.property_requirement ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold text-slate-400">Quick chips:</span>
          {PROPERTY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setForm({ ...form, property_requirement: preset })}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 transition-colors"
            >
              + {preset}
            </button>
          ))}
        </div>
        {errors.property_requirement && (
          <p className="mt-1 text-xs text-red-600">{errors.property_requirement}</p>
        )}
      </div>

      {/* Row 3: Budget and Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Budget Range *
          </label>
          <div className="relative mb-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">💰</span>
            <input
              id="budget"
              type="text"
              placeholder="e.g. ₹1.5–2 Cr or max 95L"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              disabled={loading}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 ${
                errors.budget ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setForm({ ...form, budget: b })}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
              >
                {b}
              </button>
            ))}
          </div>
          {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
        </div>

        <div>
          <label htmlFor="buying_timeline" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Buying Timeline *
          </label>
          <div className="relative mb-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⏱️</span>
            <input
              id="buying_timeline"
              type="text"
              placeholder="e.g. Within 4 weeks or Before Diwali"
              value={form.buying_timeline}
              onChange={(e) => setForm({ ...form, buying_timeline: e.target.value })}
              disabled={loading}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 ${
                errors.buying_timeline ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIMELINE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, buying_timeline: t })}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
              >
                {t}
              </button>
            ))}
          </div>
          {errors.buying_timeline && (
            <p className="mt-1 text-xs text-red-600">{errors.buying_timeline}</p>
          )}
        </div>
      </div>

      {/* Row 4: Customer Message / WhatsApp inquiry */}
      <div>
        <label htmlFor="customer_message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Inbound Customer Message / Inquiry Text *
        </label>
        <textarea
          id="customer_message"
          rows={4}
          placeholder="Paste WhatsApp inquiry, portal message (MagicBricks/99acres), or notes from phone call..."
          value={form.customer_message}
          onChange={(e) => setForm({ ...form, customer_message: e.target.value })}
          disabled={loading}
          className={`w-full p-3.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600 resize-none ${
            errors.customer_message ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-800"
          }`}
        />
        {errors.customer_message && (
          <p className="mt-1 text-xs text-red-600">{errors.customer_message}</p>
        )}
      </div>

      {/* Error notification */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {/* Submit Button & Progress Indicator */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white font-bold py-3.5 px-6 shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-slate-800 transition-all disabled:opacity-75 disabled:cursor-not-allowed border border-emerald-500/30 active:scale-98"
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">
              {loadingStep === 1
                ? "Analyzing budget & locality intent…"
                : loadingStep === 2
                ? "Evaluating deal closing velocity & objections…"
                : "Formulating call briefing & response…"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span>✨</span>
            <span>Run Real Estate AI Qualification & Score Lead</span>
          </div>
        )}
      </button>
    </form>
  );
}
