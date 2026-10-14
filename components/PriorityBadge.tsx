// ============================================================
// components/PriorityBadge.tsx
// Real Estate Lead Priority Badge.
// High contrast, scannable in fraction of a second.
// ============================================================

import type { Priority } from "@/lib/types";

const CONFIG: Record<
  Priority,
  { label: string; tag: string; classes: string; dot: string; icon: string }
> = {
  hot: {
    label: "HOT BUYER",
    tag: "High Intent",
    classes: "bg-red-50 text-red-700 border-red-200/80 shadow-xs",
    dot: "bg-red-500",
    icon: "🔥",
  },
  warm: {
    label: "WARM LEAD",
    tag: "Evaluating",
    classes: "bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs",
    dot: "bg-amber-500",
    icon: "⚡",
  },
  cold: {
    label: "COLD LEAD",
    tag: "Browsing",
    classes: "bg-sky-50 text-sky-800 border-sky-200/80 shadow-xs",
    dot: "bg-sky-500",
    icon: "❄️",
  },
};

interface Props {
  priority: Priority;
  size?: "sm" | "md";
  showTag?: boolean;
}

export function PriorityBadge({ priority, size = "md", showTag = false }: Props) {
  const cfg = CONFIG[priority] || CONFIG.warm;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${
        cfg.classes
      } ${
        size === "sm"
          ? "px-2.5 py-0.5 text-[11px]"
          : "px-3 py-1 text-xs"
      }`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
      {showTag && (
        <>
          <span className="text-slate-300">·</span>
          <span className="font-medium normal-case tracking-normal opacity-90">{cfg.tag}</span>
        </>
      )}
    </span>
  );
}
