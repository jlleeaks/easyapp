import { Circle, CircleDot, CircleDashed, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { LEARNING_STATE_LABELS, type LearningState } from "@/lib/standards";

export const STATE_COLORS: Record<LearningState, string> = {
  not_yet_observed: PALETTE.inkFaint,
  introduced: PALETTE.blue,
  developing: PALETTE.gold,
  comfortable: PALETTE.brand,
  ready_to_extend: PALETTE.violet,
};

const STATE_ICONS: Record<LearningState, typeof Circle> = {
  not_yet_observed: Circle,
  introduced: CircleDot,
  developing: CircleDashed,
  comfortable: CheckCircle2,
  ready_to_extend: ArrowUpCircle,
};

/** The single, consistent visual+text treatment for a learning state — used identically on Home, Progress, and Profile. Never relies on color alone. */
export function StateMarker({ state, size = 14 }: { state: LearningState; size?: number }) {
  const Icon = STATE_ICONS[state];
  const color = STATE_COLORS[state];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
      <Icon size={size} strokeWidth={2.25} />
      {LEARNING_STATE_LABELS[state]}
    </span>
  );
}
