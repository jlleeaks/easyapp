import { PALETTE } from "@/lib/palette";
import { STATE_COLORS } from "@/components/ui/StateMarker";
import type { LearningState } from "@/lib/standards";

const STAGES: LearningState[] = ["not_yet_observed", "introduced", "developing", "comfortable"];

/**
 * Two deliberately different progress visuals, never interchangeable:
 * - Numeric (X of Y): only for genuinely countable things, e.g. "3 of 6 areas observed."
 *   Never used for a single milestone's quality/mastery — Easy has no reliable percentage for that.
 * - Segmented (stage bar): for any single milestone's developmental state, since "40% comfortable
 *   at reading comprehension" isn't a real measurement Easy can defend.
 */
export function NumericProgressBar({
  observed,
  total,
  label,
  fillColor,
  trackColor,
}: {
  observed: number;
  total: number;
  label?: string;
  fillColor?: string;
  trackColor?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((observed / total) * 100)) : 0;
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold mb-1.5" style={{ color: PALETTE.inkSoft }}>
          {label}
        </p>
      )}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: trackColor ?? PALETTE.line }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: fillColor ?? PALETTE.brand }} />
      </div>
    </div>
  );
}

export function DevelopmentalStageBar({ state, size = "sm" }: { state: LearningState; size?: "sm" | "md" }) {
  const activeIdx = state === "ready_to_extend" ? 3 : STAGES.indexOf(state);
  const height = size === "md" ? "h-2" : "h-1.5";
  return (
    <div className="flex gap-1" role="img" aria-label={`Developmental stage: ${state.replace(/_/g, " ")}`}>
      {STAGES.map((s, i) => (
        <div
          key={s}
          className={`flex-1 ${height} rounded-full`}
          style={{ background: i <= activeIdx ? STATE_COLORS[state] : PALETTE.line }}
        />
      ))}
    </div>
  );
}
