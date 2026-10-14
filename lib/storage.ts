// ============================================================
// lib/storage.ts
// localStorage-backed persistence layer.
// All reads/writes go through these helpers so switching to a
// real DB later only requires changing this file.
//
// WHY localStorage?
//   - Zero config, zero cost, works offline
//   - Persists across page refreshes
//   - No backend/Supabase account needed to get started
//   - Can be swapped for Supabase/SQLite with a one-file change
// ============================================================

import type { Lead } from "./types";

const STORAGE_KEY = "leadpilot_leads";

// Read all leads from localStorage, sorted by score descending.
// Returns [] if nothing is stored yet (first visit).
export function getLeads(): Lead[] {
  if (typeof window === "undefined") return []; // SSR guard
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const leads: Lead[] = JSON.parse(raw);
    // Always return sorted by score so the list is always prioritised
    return leads.sort((a, b) => b.analysis.score - a.analysis.score);
  } catch {
    console.error("Failed to read leads from localStorage");
    return [];
  }
}

// Retrieve a single lead by ID — O(n) but n is always small here
export function getLeadById(id: string): Lead | null {
  return getLeads().find((l) => l.id === id) ?? null;
}

// Persist a new lead (append to existing list)
export function saveLead(lead: Lead): void {
  if (typeof window === "undefined") return;
  const existing = getLeads();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, lead]));
}

// Update any field of an existing lead in-place.
// Uses a merge strategy: spread existing lead, then spread updates.
export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  if (typeof window === "undefined") return null;
  const leads = getLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  const updated = { ...leads[index], ...updates };
  leads[index] = updated;
  // Save the unsorted array so order is stable on disk; getLeads()
  // always re-sorts on read
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  return updated;
}

// Wipe all leads — useful for a "reset demo" button
export function clearLeads(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Seed sample leads only on first run (when storage is empty).
// Called from the root layout so seeding happens once ever.
export function seedIfEmpty(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }
}
