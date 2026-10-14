import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadPilot — Real Estate AI Lead Manager & Sales Coach",
  description: "AI-powered real estate lead qualification, instant scoring, call prep, and client triage for brokers and developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        {/* Top Announcement Bar */}
        <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium tracking-wide text-slate-200">
                Real Estate AI Qualification Engine
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">
                Automated Lead Scoring, Call Briefs & WhatsApp Follow-ups
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400">
                Gemini 3.5 AI Active
              </span>
            </div>
          </div>
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Luxury Real Estate Architectural Monogram */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-amber-400 flex items-center justify-center shadow-sm border border-amber-500/30 group-hover:border-amber-400/60 transition-colors">
                <svg
                  className="w-5 h-5 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Modern Luxury High-Rise & Roof */}
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9h1" />
                  <path d="M9 13h1" />
                  <path d="M9 17h1" />
                  <path d="M15 13h1" />
                  <path d="M15 17h1" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                    Lead<span className="text-emerald-700">Pilot</span>
                  </span>
                  <span className="bg-amber-100/80 text-amber-800 border border-amber-300/50 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    ESTATE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                  High-Value Buyer Scoring & Triage
                </p>
              </div>
            </Link>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Inbound Pipeline
              </Link>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-slate-800 transition-all active:scale-95 border border-emerald-600/30"
              >
                <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Property Lead</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
          {children}
        </main>

        {/* Professional Real Estate Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">LeadPilot Real Estate</span>
              <span>—</span>
              <span>Empowering agents, brokers & property developers with instant buyer intelligence</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>Secure Local Encrypted Storage</span>
              <span>·</span>
              <span>Gemini Flash AI Engine</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
