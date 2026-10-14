// ============================================================
// components/ScoreRing.tsx
// Circular gauge showing lead score 0-100 with architectural elegance.
// Uses SVG stroke-dashoffset trick for the progress arc.
// ============================================================

interface Props {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function ScoreRing({ score, size = 56, showLabel = false }: Props) {
  const strokeWidth = size >= 64 ? 5 : 4;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Real estate priority palette:
  // Ruby Red for Hot (High Intent), Amber Gold for Warm, Slate Sky for Cold
  const color =
    score >= 70 ? "#dc2626" : score >= 40 ? "#d97706" : "#0284c7";

  const trackColor =
    score >= 70 ? "#fee2e2" : score >= 40 ? "#fef3c7" : "#e0f2fe";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span
          className={`font-black tracking-tight leading-none ${
            size >= 64 ? "text-lg" : "text-xs"
          }`}
          style={{ color }}
        >
          {score}
        </span>
        {showLabel && size >= 64 && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Score
          </span>
        )}
      </div>
    </div>
  );
}
