# ✈️ LeadPilot — AI Real Estate Lead Manager

> **AI-powered lead scoring, prioritisation, call prep, and follow-up drafting for real-estate salespersons.**
> Built with Next.js 16 (App Router) + Tailwind CSS v4 + Google Gemini.

---

## What It Does

LeadPilot transforms the overwhelming inbox of a busy real-estate salesperson into a triage system they can scan in seconds:

| Feature | What it does |
|---|---|
| **Lead Intake Form** | Capture name, location, property requirement, budget, timeline, and customer message |
| **AI Analysis** | Scores 0–100, assigns hot/warm/cold priority, extracts key requirements, objections, next action, and a ready-to-send suggested response |
| **Lead List** | All leads sorted by score. Filter by priority. Coloured cards scannable in seconds |
| **AI Chat** | Per-lead sales coach locked to that lead's context — ask "what should I emphasise?" or "make my reply more assertive" |
| **Call Prep Brief** | One-page brief: opening line, numbered talking points, objection/answer pairs |
| **Post-Call Update** | Enter call notes → AI re-scores the lead, updates priority, and drafts a WhatsApp follow-up |

---

## Architecture Overview

```
leadpilot/
├── app/
│   ├── layout.tsx              # Root layout + global nav bar
│   ├── page.tsx                # Lead list (home) — client component
│   ├── new/
│   │   └── page.tsx            # New lead form page
│   ├── leads/[id]/
│   │   └── page.tsx            # Lead detail page (4 tabs)
│   └── api/
│       ├── analyse/route.ts    # POST — analyse a new lead
│       ├── chat/route.ts       # POST — per-lead AI chat
│       ├── call-prep/route.ts  # POST — generate call brief
│       └── post-call/route.ts  # POST — post-call re-score + WhatsApp
│
├── components/
│   ├── LeadCard.tsx            # Card on the list view
│   ├── LeadForm.tsx            # Intake form with validation + loading state
│   ├── ChatPanel.tsx           # AI chat UI (suggestions, history, typing indicator)
│   ├── CallPrepPanel.tsx       # Call prep brief display
│   ├── PostCallPanel.tsx       # Post-call notes + results
│   ├── PriorityBadge.tsx       # Red/orange/blue badge
│   ├── ScoreRing.tsx           # SVG circular score indicator
│   └── CopyButton.tsx          # One-click clipboard copy
│
└── lib/
    ├── ai.ts                   # ALL Gemini API calls (one file)
    ├── types.ts                # All TypeScript types
    ├── storage.ts              # localStorage read/write helpers
    └── seeds.ts                # 5 pre-built sample leads
```

### Data Flow

```
Browser (client component)
  └─► fetch("/api/analyse")          ← POST with form data
         └─► lib/ai.ts               ← Gemini API call (server only)
                └─► JSON response
  └─► localStorage                   ← persist Lead object
  └─► UI re-renders
```

**Why this separation matters:** The Gemini API key lives exclusively in `.env.local` and is only accessed in `lib/ai.ts`, which is imported only by server-side API routes. Zero risk of key exposure to the browser.

---

## AI Model & How It's Called

| Item | Detail |
|---|---|
| **Model** | `gemini-3.5-flash-lite` (default, configurable via `GEMINI_MODEL`) |
| **SDK** | `@google/generative-ai` v0.24 |
| **JSON Mode** | `responseMimeType: "application/json"` + `responseSchema` in `generationConfig` |
| **Retry** | Each call retries once on bad/invalid JSON before throwing |
| **Chat** | Uses `model.startChat()` with `history` for per-lead context |

### Scoring Rubric (embedded in system prompt)

| Signal | Points |
|---|---|
| Clear, realistic budget | +20 |
| Short timeline (< 3 months) | +20 |
| Specific location named | +20 |
| Specific property type/size | +20 |
| Engaged, detailed message | +20 |
| Vague / "just browsing" | -15 |
| No budget given | -10 |
| Long timeline or none | -10 |
| Very broad location | -10 |

**Score → Priority:** ≥70 = hot 🔥, 40–69 = warm 🟠, <40 = cold 🔵

---

## Storage

**localStorage** — zero config, zero cost, zero database required.

All leads are serialised as JSON in a single `leadpilot_leads` key. The `lib/storage.ts` file provides typed `getLeads()`, `getLeadById()`, `saveLead()`, `updateLead()`, `clearLeads()`, and `seedIfEmpty()` helpers. Switching to Supabase or SQLite later only requires changing `lib/storage.ts`.

---

## How to Run Locally

### Prerequisites
- Node.js 20+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### Steps

```bash
# 1. Clone / navigate to the project
cd leadpilot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and set:
# GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.5-flash-lite (optional, defaults to gemini-3.5-flash-lite)

# 4. Start the development server
npm run dev

# 5. Open the app
# http://localhost:3000 (or http://localhost:3001 if port 3000 is occupied)
```

The app seeds 5 sample leads automatically on first open.

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| **All AI in `lib/ai.ts`** | Single source of truth. Swap models, tune prompts, add logging in one place |
| **localStorage for storage** | Zero infrastructure, instant setup, works offline. Typed helpers make it easy to migrate |
| **JSON mode + schema** | Guarantees structured output. Retry-once pattern handles the rare malformed response |
| **Server-side API routes** | API key never reaches the browser. All Gemini calls go through Next.js edge-compatible routes |
| **Seed leads** | App is populated on first visit — no waiting for API calls to see the UI |
| **4-tab detail view** | Keeps each feature focused; avoids wall-of-text on a single page |
| **Score ring SVG** | Pure SVG, no external charting library, zero bundle overhead |

---

## Known Limitations

- **localStorage is device-local** — leads don't sync across browsers/devices. Use Supabase for multi-device.
- **No authentication** — anyone who opens the URL can see leads. Add NextAuth or Clerk for production.
- **Gemini free tier rate limits** — analysing many leads simultaneously may hit quota (60 RPM on free tier). Add request queuing for high volume.
- **No image/document upload** — property brochures must be described in text.
- **No email/WhatsApp integration** — the suggested response and WhatsApp draft must be copy-pasted manually.

---

## Adding Real Database Storage (Supabase)

Replace `lib/storage.ts` with Supabase client calls:

```bash
npm install @supabase/supabase-js
```

```ts
// lib/storage.ts (Supabase version)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function getLeads(): Promise<Lead[]> {
  const { data } = await supabase.from('leads').select('*').order('score', { ascending: false })
  return data ?? []
}
// ... etc
```

Create a `leads` table in Supabase with columns matching the `Lead` interface.
