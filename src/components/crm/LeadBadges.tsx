import { TEMPERATURE_STYLES } from "@/lib/constants";
import { cn, formatScore } from "@/lib/utils";
import type { LeadTemperature } from "@/types/lead";
import { TEMPERATURE_LABELS } from "@/types/lead";

export function TemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  const styles = TEMPERATURE_STYLES[temperature];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        styles.bg,
        styles.text,
        styles.ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {TEMPERATURE_LABELS[temperature]}
    </span>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-rose-500" : score >= 40 ? "bg-amber-400" : "bg-sky-400";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700">{formatScore(score)}</span>
    </div>
  );
}
