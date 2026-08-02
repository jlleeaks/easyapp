import { ThumbsUp, Target } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Card, Eyebrow } from "@/components/ui/primitives";
import type { ProfileInsight } from "@/lib/types";

function dedupe(items: ProfileInsight[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.text);
    if (out.length >= limit) break;
  }
  return out;
}

export function StrengthsOverviewCard({
  childName,
  strengths,
  growthAreas,
}: {
  childName: string;
  strengths: ProfileInsight[];
  growthAreas: ProfileInsight[];
}) {
  const topStrengths = dedupe(strengths, 5);
  const topGrowthAreas = dedupe(growthAreas, 5);

  if (topStrengths.length === 0 && topGrowthAreas.length === 0) return null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <p className="text-[15px] font-semibold mb-4">{childName}&rsquo;s strengths &amp; growth areas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topStrengths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <ThumbsUp size={13} color={PALETTE.brand} />
                <Eyebrow color={PALETTE.brand}>Strong in</Eyebrow>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topStrengths.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: PALETTE.brandSoft, color: PALETTE.brand }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {topGrowthAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target size={13} color={PALETTE.gold} />
                <Eyebrow color={PALETTE.gold}>Working on</Eyebrow>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topGrowthAreas.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: PALETTE.goldSoft, color: "#8a5c10" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs mt-4" style={{ color: PALETTE.inkFaint }}>
          Pulled from report cards, graded assignments, and real sessions — not a guess.
        </p>
      </div>
    </Card>
  );
}
