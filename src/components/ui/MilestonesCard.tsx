import { Trophy } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { Card, Eyebrow } from "@/components/ui/primitives";
import type { Skill } from "@/lib/types";

export function MilestonesCard({ childName, skills }: { childName: string; skills: Skill[] }) {
  const mastered = skills
    .filter((sk) => sk.stage === "comfortable")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (mastered.length === 0) return null;

  return (
    <Card tint={PALETTE.goldSoft} style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <Trophy size={13} color={PALETTE.gold} />
          <Eyebrow color={PALETTE.gold}>Milestones</Eyebrow>
        </div>
        <p className="text-sm mb-4" style={{ color: PALETTE.inkSoft }}>
          {mastered.length} skill{mastered.length === 1 ? "" : "s"} {childName} has genuinely got comfortable
          with — real progress, and it&apos;s happening because of what you&apos;re doing at home:
        </p>
        <div className="flex flex-wrap gap-3">
          {mastered.map((sk) => {
            const meta = subjectMeta(sk.subject);
            return (
              <div
                key={sk.id}
                className="flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-full"
                style={{ background: "#fff", border: `1px solid ${PALETTE.goldLine}` }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 26, height: 26, borderRadius: "50%", background: meta.color }}
                >
                  <Trophy size={12} color="#fff" />
                </div>
                <span className="text-sm font-bold">{sk.skill_name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
