// ============================================================
// lib/seeds.ts
// 5 sample leads (mix of hot / warm / cold) injected on first open.
// Realistic data so the app looks populated and useful immediately.
// Scores are pre-set to avoid an API call just to show the UI.
// ============================================================

import type { Lead } from "./types";

export const SEED_LEADS: Lead[] = [
  // ---- HOT LEAD -----------------------------------------------
  {
    id: "seed-001",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    form_data: {
      name: "Priya Sharma",
      location: "Bandra West, Mumbai",
      property_requirement: "3BHK flat, above 1200 sq ft, sea-facing preferred",
      budget: "₹3.5–4 Cr",
      buying_timeline: "Within 6 weeks",
      customer_message:
        "Hi, I've been searching for 3 months now. We're relocating from Delhi for my husband's job. We have our home loan pre-approved at 3.8 Cr. Need parking for 2 cars. Could you share availability for this weekend? We can visit anytime Saturday.",
    },
    analysis: {
      summary:
        "Pre-approved buyer relocating from Delhi, ready to visit this weekend. Extremely time-sensitive due to job relocation.",
      intent: "Ready to buy immediately — pre-approved loan, specific location, clear timeline.",
      key_requirements: [
        "3BHK, 1200+ sq ft",
        "Bandra West only",
        "Sea-facing preferred",
        "2 car parking",
        "Budget ₹3.5–4 Cr",
      ],
      objections: [
        "May not find sea-facing within budget",
        "Weekend-only availability for viewings",
      ],
      next_action:
        "Call immediately to schedule Saturday viewing. Prepare 3–4 shortlisted units with parking.",
      suggested_response:
        "Hi Priya, fantastic — your pre-approval makes this very smooth. I have 2 sea-facing 3BHKs in Bandra West that fit your criteria perfectly. Can we do Saturday at 11 AM? I'll send you the details right away.",
      score: 95,
      priority: "hot",
      urgency_reason: "Pre-approved loan + 6-week deadline + weekend visit request.",
    },
    chat_history: [],
    call_brief: null,
    post_call_notes: null,
    post_call_update: null,
  },

  // ---- HOT LEAD -----------------------------------------------
  {
    id: "seed-002",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    form_data: {
      name: "Arjun Mehta",
      location: "Koramangala, Bengaluru",
      property_requirement: "2BHK apartment, gated community, gym + pool mandatory",
      budget: "₹85–95 L",
      buying_timeline: "Before end of month",
      customer_message:
        "I have been transferred back to Bengaluru and my company is giving me a joining bonus. I want to close this quickly. Budget is firm at 95L max. Need a community with security, gym and pool — I travel a lot so amenities matter. Koramangala or HSR only.",
    },
    analysis: {
      summary:
        "Motivated buyer with a joining bonus and a hard month-end deadline. Amenity-conscious, firm budget.",
      intent: "Buy before end of month, firm budget, very specific requirements.",
      key_requirements: [
        "2BHK, gated community",
        "Gym + pool mandatory",
        "Koramangala or HSR Layout",
        "Budget max ₹95 L",
        "Good security",
      ],
      objections: [
        "Budget may be tight for Koramangala with all amenities",
        "Month-end timeline is very tight for paperwork",
      ],
      next_action:
        "Send 3 options in Koramangala / HSR with amenities today. Arrange viewing within 48 hours.",
      suggested_response:
        "Hi Arjun, welcome back to Bengaluru! I have two gated communities in Koramangala and one in HSR that match exactly — gym, pool, 24/7 security, within your budget. Shall I send the brochures now and schedule a visit tomorrow evening?",
      score: 88,
      priority: "hot",
      urgency_reason: "Month-end deadline + joining bonus cash + location-specific.",
    },
    chat_history: [],
    call_brief: null,
    post_call_notes: null,
    post_call_update: null,
  },

  // ---- WARM LEAD -----------------------------------------------
  {
    id: "seed-003",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    form_data: {
      name: "Neha Gupta",
      location: "Noida Sector 62 or nearby",
      property_requirement: "3BHK or 4BHK villa / independent house",
      budget: "₹1.2–1.8 Cr",
      buying_timeline: "3–6 months",
      customer_message:
        "We want to upgrade from our current apartment to a villa with a garden. Kids need outdoor space. Budget is approximately 1.5 Cr but can stretch. We are comparing a few areas so haven't finalised.",
    },
    analysis: {
      summary:
        "Upgrade buyer with family, specific need for garden/outdoor space, flexible budget, comparing options.",
      intent: "Upgrade from apartment to villa for family, 3–6 month horizon.",
      key_requirements: [
        "Villa / independent house",
        "Garden / outdoor space",
        "3BHK or 4BHK",
        "Noida Sector 62 area",
        "Budget ~₹1.5 Cr, can stretch",
      ],
      objections: [
        "Comparing multiple areas — not committed yet",
        "6-month timeline means no urgency",
        "Children's school location may influence decision",
      ],
      next_action:
        "Send curated villa options with garden photos. Schedule a call to understand school proximity needs and narrow the area.",
      suggested_response:
        "Hi Neha, great choice upgrading to a villa — outdoor space makes a huge difference with kids! I have 3 options in Sector 62 and nearby Sector 50 with lovely gardens. Can I call you Thursday to discuss what schools you're considering? That'll help me filter the best one for you.",
      score: 58,
      priority: "warm",
      urgency_reason: "Active search but 3–6 month timeline and comparison stage.",
    },
    chat_history: [],
    call_brief: null,
    post_call_notes: null,
    post_call_update: null,
  },

  // ---- WARM LEAD -----------------------------------------------
  {
    id: "seed-004",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2d ago
    form_data: {
      name: "Rohan Joshi",
      location: "Pune – Hinjewadi or Wakad",
      property_requirement: "2BHK flat, close to IT park",
      budget: "₹65–80 L",
      buying_timeline: "4–5 months",
      customer_message:
        "Looking for a good 2BHK near Hinjewadi IT park. I work from office 3 days a week so commute matters. Budget is around 70-75L but can go to 80L for the right place. Not in a massive hurry but want to buy before I renew my lease in January.",
    },
    analysis: {
      summary:
        "IT professional seeking proximity to office, practical buyer with lease-driven deadline in January.",
      intent: "Buy before January lease renewal, commute-conscious, flexible budget.",
      key_requirements: [
        "2BHK near Hinjewadi IT Park",
        "Short commute (<20 min)",
        "Budget ₹70–80 L",
        "Good connectivity",
      ],
      objections: [
        "4–5 month timeline, not urgent",
        "Will compare multiple projects",
        "Price-sensitive",
      ],
      next_action:
        "Share top 3 projects within 3km of Hinjewadi Phase 1/2. Highlight commute time and parking.",
      suggested_response:
        "Hi Rohan, proximity to Hinjewadi is a smart priority! I have two projects in Wakad and one in Mahalunge — all under 3 km from Phase 2. Let me send the details with commute maps. Would a site visit this weekend work?",
      score: 55,
      priority: "warm",
      urgency_reason: "January lease renewal creates a soft deadline, but no urgency yet.",
    },
    chat_history: [],
    call_brief: null,
    post_call_notes: null,
    post_call_update: null,
  },

  // ---- COLD LEAD -----------------------------------------------
  {
    id: "seed-005",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3d ago
    form_data: {
      name: "Aditya Kumar",
      location: "Anywhere in Chennai",
      property_requirement: "Not sure, maybe 2BHK or 3BHK",
      budget: "Not decided yet",
      buying_timeline: "Someday",
      customer_message: "Just browsing for now. What are good areas in Chennai to invest in?",
    },
    analysis: {
      summary:
        "Very early-stage, no budget or timeline defined, researching the market rather than actively buying.",
      intent: "Information gathering / investment research. No purchase intent yet.",
      key_requirements: ["No specific requirements defined", "Open to any location in Chennai"],
      objections: [
        "No budget defined",
        "No timeline",
        "Not committed to buying",
        "May be investor rather than end-user",
      ],
      next_action:
        "Send a market overview email for Chennai. Add to nurture sequence. Follow up in 4 weeks.",
      suggested_response:
        "Hi Aditya, happy to help you explore Chennai! I'll send you a quick overview of the top emerging areas and current price trends. When you have a rough budget in mind, let's have a call — I can narrow it down quickly. No pressure at all!",
      score: 12,
      priority: "cold",
      urgency_reason: "No budget, no timeline, just browsing — long nurture needed.",
    },
    chat_history: [],
    call_brief: null,
    post_call_notes: null,
    post_call_update: null,
  },
];
