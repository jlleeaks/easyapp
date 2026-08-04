"use client";

import { Clock } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Eyebrow, Card, AiMarkdown } from "@/components/ui/primitives";
import type { Briefing } from "@/lib/types";

export function CompactBriefingView({ briefing }: { briefing: Briefing }) {
  const opening = briefing.analogies?.[0] || briefing.why_it_matters;
  const askWhileTeaching = briefing.followup_questions?.[0];
  const supportTags = [
    briefing.fine_motor_support ? "fine motor" : null,
    briefing.social_emotional_support ? "social-emotional" : null,
    briefing.independence_skill ? "independence" : null,
  ].filter(Boolean);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-serif-display" style={{ fontSize: 21, fontWeight: 700 }}>{briefing.skill}</h2>
        {briefing.estimated_minutes && (
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: PALETTE.goldSoft, color: PALETTE.gold }}
          >
            <Clock size={11} /> {briefing.estimated_minutes}
          </span>
        )}
      </div>
      {supportTags.length > 0 && (
        <p className="text-xs mb-3" style={{ color: PALETTE.inkFaint }}>
          Also supports: {supportTags.join(", ")}
        </p>
      )}
      {supportTags.length === 0 && <div className="mb-4" />}

      {briefing.household_objects?.length > 0 && (
        <Card>
          <div className="p-4">
            <Eyebrow>Grab this</Eyebrow>
            {briefing.household_objects.map((h, i) => (
              <div key={i} className="text-sm mt-1">• {h}</div>
            ))}
          </div>
        </Card>
      )}

      {opening && (
        <Card tint={PALETTE.brandSoft}>
          <div className="p-4">
            <Eyebrow color={PALETTE.brand}>Say this first</Eyebrow>
            <div className="text-base font-semibold mt-1">
              <AiMarkdown content={opening} inline />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4">
          <Eyebrow>3 steps</Eyebrow>
          <ol className="text-sm mt-1 flex flex-col gap-2">
            <li>
              <span className="font-bold">1.</span>{" "}
              {briefing.parent_model ? <AiMarkdown content={briefing.parent_model} inline /> : "Show it using what you grabbed above."}
            </li>
            {askWhileTeaching && (
              <li>
                <span className="font-bold">2.</span> Ask: <AiMarkdown content={askWhileTeaching} inline />
              </li>
            )}
            {briefing.praise_phrase && (
              <li>
                <span className="font-bold">3.</span> <AiMarkdown content={briefing.praise_phrase} inline />
              </li>
            )}
          </ol>
        </div>
      </Card>

      {briefing.stuck_tip && (
        <Card accent="#F0C8B8" tint={PALETTE.accentSoft}>
          <div className="p-4">
            <Eyebrow color={PALETTE.accent}>If they get stuck</Eyebrow>
            <div className="text-sm mt-1">
              <AiMarkdown content={briefing.stuck_tip} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
