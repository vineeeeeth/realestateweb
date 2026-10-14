"use client";
// ============================================================
// components/ChatPanel.tsx
// Real Estate Deal Coach & Negotiation Assistant.
// Context-locked to the active buyer lead.
// ============================================================

import { useState, useRef, useEffect } from "react";
import type { Lead, ChatMessage } from "@/lib/types";
import { updateLead } from "@/lib/storage";

interface Props {
  lead: Lead;
  onUpdate: (updated: Lead) => void;
}

const REAL_ESTATE_SUGGESTIONS = [
  "How should I pitch our price/sqft against their budget?",
  "Draft an irresistible WhatsApp site-visit invitation",
  "What are the top 3 objections this buyer will raise?",
  "How can I create urgency without sounding desperate?",
  "Suggest 2 alternate micro-markets if budget is tight",
];

export function ChatPanel({ lead, onUpdate }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(lead.chat_history);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setInput("");
    setError(null);

    const newUserMsg: ChatMessage = {
      role: "user",
      content: userMsg,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: { form_data: lead.form_data, analysis: lead.analysis },
          chat_history: messages,
          message: userMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      const finalHistory = [...updatedHistory, assistantMsg];
      setMessages(finalHistory);

      const updated = updateLead(lead.id, { chat_history: finalHistory });
      if (updated) onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages(updatedHistory.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Real Estate Suggested Questions */}
      {messages.length === 0 && (
        <div className="p-4 bg-white border-b border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            <span>💡</span> Real Estate Coach Quick Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {REAL_ESTATE_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all font-medium text-left shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-16 max-w-sm mx-auto text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-xl mx-auto mb-3">
              🏛️
            </div>
            <h4 className="font-bold text-slate-700 text-sm mb-1">
              Real Estate Sales Coach Ready
            </h4>
            <p className="text-xs text-slate-500">
              Ask about negotiation tactics, neighborhood comps, pricing psychology, or drafting follow-ups for {lead.form_data.name}.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-slate-700 shadow-2xs">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-2xs ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-emerald-700 to-slate-900 text-white rounded-tr-xs"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === "user" ? "text-emerald-200/70" : "text-slate-400"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-200 shadow-2xs">
                You
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-700">
              AI
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium mr-1">
                  Coach formulating response
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error alert */}
      {error && (
        <div className="mx-4 mb-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
            placeholder="Ask anything about closing this lead, handling price, or scripting replies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(input)
            }
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white text-sm font-semibold hover:from-emerald-500 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Ask Coach
          </button>
        </div>
      </div>
    </div>
  );
}
