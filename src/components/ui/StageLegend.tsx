import { PALETTE, SKILL_STAGES, STAGE_COLORS, STAGE_LABELS } from "@/lib/palette";

export function StageLegend() {
  return (
    <div className="rounded-2xl p-4" style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}>
      <p className="text-xs font-semibold mb-3" style={{ color: PALETTE.inkSoft }}>
        Each ring below shows one of 4 stages — never a score or a percentage:
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2.5">
        {SKILL_STAGES.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
              <circle cx="10" cy="10" r="8" fill="none" stroke={PALETTE.line} strokeWidth="3" strokeDasharray="1.5 2.5" />
              {i > 0 && (
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke={STAGE_COLORS[stage]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(i / (SKILL_STAGES.length - 1)) * 2 * Math.PI * 8} 999`}
                  transform="rotate(-90 10 10)"
                />
              )}
            </svg>
            <span className="text-xs font-semibold">{STAGE_LABELS[stage]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
