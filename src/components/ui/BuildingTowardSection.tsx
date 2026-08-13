import Link from "next/link";
import { Hand, Smile, Footprints } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { suggestedMomentForCategory, type GrowthMoment } from "@/lib/growthMoments";
import type { Briefing, Session } from "@/lib/types";

const LIFE_SKILL_CATEGORIES = [
  { key: "fine_motor_support", label: "Fine motor", icon: Hand, momentCategory: "fine-motor" } as const,
  { key: "social_emotional_support", label: "Social-emotional", icon: Smile, momentCategory: "social-emotional" } as const,
  { key: "independence_skill", label: "Independence", icon: Footprints, momentCategory: "independence" } as const,
] satisfies { key: keyof Briefing; label: string; icon: typeof Hand; momentCategory: GrowthMoment["category"] }[];

/** Most recent session where Easy actually flagged this field — never a fabricated status. */
function latestLifeSkillNote(sessions: Session[], field: keyof Briefing): { text: string; date: string } | null {
  for (const s of sessions) {
    const val = s.briefing?.[field];
    if (typeof val === "string" && val.trim()) return { text: val, date: s.created_at };
  }
  return null;
}

// Academic (math/writing/reading) progress now lives in the roadmap summary at the top
// of Home — this section stays scoped to the non-academic side so the two don't repeat
// each other.
export function BuildingTowardSection({
  childName,
  sessions,
}: {
  childName: string;
  sessions: Session[];
}) {
  return (
    <div>
      <SectionHeading color={PALETTE.violetDeep}>What {childName} Is Also Building Toward</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        {LIFE_SKILL_CATEGORIES.map((cat) => {
          const note = latestLifeSkillNote(sessions, cat.key);
          const suggestion = note ? null : suggestedMomentForCategory(cat.momentCategory);
          return (
            <div key={cat.key} className="rounded-2xl p-4" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <cat.icon size={14} color={PALETTE.violetDeep} />
                <p className="text-[11px] font-bold uppercase" style={{ color: PALETTE.violetDeep, letterSpacing: "0.04em" }}>
                  {cat.label}
                </p>
              </div>
              {note ? (
                <p className="text-xs leading-snug" style={{ color: PALETTE.inkSoft }}>
                  {note.text.length > 110 ? note.text.slice(0, 107).trimEnd() + "…" : note.text}
                </p>
              ) : suggestion ? (
                <>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.04em" }}>
                    Try this
                  </p>
                  <p className="text-xs leading-snug mb-1" style={{ color: PALETTE.inkSoft }}>
                    {suggestion.activity(childName)}
                  </p>
                  <p className="text-xs italic" style={{ color: PALETTE.violetDeep }}>
                    {suggestion.benefit}
                  </p>
                </>
              ) : (
                <p className="text-xs font-semibold" style={{ color: PALETTE.inkFaint }}>
                  Not yet observed
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Link href="/progress" className="text-xs font-bold underline" style={{ color: PALETTE.brand }}>
        View {childName}&apos;s full kindergarten roadmap
      </Link>
    </div>
  );
}
