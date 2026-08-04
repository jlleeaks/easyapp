"use client";

import { Clock } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Eyebrow, Card, AiMarkdown } from "@/components/ui/primitives";
import type { Briefing } from "@/lib/types";

const DELAY = [0, 45, 90, 135, 180, 225, 270, 315, 360];

export function BriefingView({ briefing }: { briefing: Briefing }) {
  return (
    <div>
      <Eyebrow color={PALETTE.accent}>Tonight&apos;s briefing</Eyebrow>
      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
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

      <Card delay={DELAY[0]}>
        <div className="p-5">
          <Eyebrow>Why it matters</Eyebrow>
          <div className="text-sm">
            <AiMarkdown content={briefing.why_it_matters} />
          </div>
        </div>
      </Card>

      {(briefing.parent_model || briefing.child_action || briefing.what_success_looks_like) && (
        <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft} delay={DELAY[0]}>
          <div className="p-5 flex flex-col gap-3">
            {briefing.parent_model && (
              <div>
                <Eyebrow color={PALETTE.brand}>Show her first</Eyebrow>
                <div className="text-sm"><AiMarkdown content={briefing.parent_model} /></div>
              </div>
            )}
            {briefing.child_action && (
              <div>
                <Eyebrow color={PALETTE.brand}>Then she&apos;ll</Eyebrow>
                <div className="text-sm"><AiMarkdown content={briefing.child_action} /></div>
              </div>
            )}
            {briefing.what_success_looks_like && (
              <div>
                <Eyebrow color={PALETTE.brand}>What success looks like</Eyebrow>
                <div className="text-sm"><AiMarkdown content={briefing.what_success_looks_like} /></div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card delay={DELAY[1]}>
        <div className="p-5">
          <Eyebrow>Analogies to try</Eyebrow>
          {briefing.analogies?.map((a, i) => (
            <div key={i} className="text-sm mb-1">• {a}</div>
          ))}
        </div>
      </Card>

      <Card delay={DELAY[2]}>
        <div className="p-5">
          <Eyebrow>Hands-on objects</Eyebrow>
          {briefing.household_objects?.map((h, i) => (
            <div key={i} className="text-sm mb-1">• {h}</div>
          ))}
        </div>
      </Card>

      {briefing.followup_questions?.length > 0 && (
        <Card delay={DELAY[3]}>
          <div className="p-5">
            <Eyebrow color={PALETTE.brand}>Ask while you teach</Eyebrow>
            {briefing.followup_questions.map((q, i) => (
              <div key={i} className="text-sm mb-1">💬 {q}</div>
            ))}
          </div>
        </Card>
      )}

      <Card delay={DELAY[4]}>
        <div className="p-5">
          <Eyebrow>If they get stuck</Eyebrow>
          <div className="text-sm mb-2">
            <AiMarkdown content={briefing.stuck_tip} />
          </div>
          {briefing.alternate_approach && (
            <div className="text-sm mb-2 pt-2" style={{ borderTop: `1px solid ${PALETTE.line}` }}>
              <span className="font-semibold">Still not clicking?</span>{" "}
              <AiMarkdown content={briefing.alternate_approach} inline />
            </div>
          )}
          <div className="text-xs" style={{ color: PALETTE.inkSoft }}>
            {briefing.is_new_concept
              ? "This is brand new for them — show it clearly once before stepping back."
              : "They've seen this before — a little struggle here is a good thing."}
          </div>
        </div>
      </Card>

      {briefing.watch_for && (
        <Card accent="#F0C8B8" tint={PALETTE.accentSoft} delay={DELAY[5]}>
          <div className="p-5">
            <Eyebrow color={PALETTE.accent}>Watch for</Eyebrow>
            <div className="text-sm">
              <AiMarkdown content={briefing.watch_for} />
            </div>
          </div>
        </Card>
      )}

      <Card delay={DELAY[6]}>
        <div className="p-5">
          <Eyebrow>How to deliver it</Eyebrow>
          <div className="text-sm mb-2">
            🗣️ <AiMarkdown content={briefing.praise_phrase} inline />
          </div>
          <div className="text-sm">
            🤝 <AiMarkdown content={briefing.autonomy_tip} inline />
          </div>
        </div>
      </Card>

      {briefing.real_life_connection && (
        <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft} delay={DELAY[7]}>
          <div className="p-5">
            <Eyebrow color={PALETTE.brand}>Keep it going this week</Eyebrow>
            <div className="text-sm">
              <AiMarkdown content={briefing.real_life_connection} />
            </div>
          </div>
        </Card>
      )}

      {briefing.math_anxiety_note && (
        <Card accent={PALETTE.brandLine} tint={PALETTE.brandSoft} delay={DELAY[8]}>
          <div className="p-5">
            <Eyebrow color={PALETTE.brand}>A note for you</Eyebrow>
            <div className="text-sm">
              <AiMarkdown content={briefing.math_anxiety_note} />
            </div>
          </div>
        </Card>
      )}

      {(briefing.fine_motor_support || briefing.social_emotional_support || briefing.independence_skill) && (
        <Card delay={DELAY[8]}>
          <div className="p-5">
            <Eyebrow>Also supports</Eyebrow>
            <div className="flex flex-col gap-2 mt-1">
              {briefing.fine_motor_support && (
                <div className="text-sm">✋ <AiMarkdown content={briefing.fine_motor_support} inline /></div>
              )}
              {briefing.social_emotional_support && (
                <div className="text-sm">💛 <AiMarkdown content={briefing.social_emotional_support} inline /></div>
              )}
              {briefing.independence_skill && (
                <div className="text-sm">🌱 <AiMarkdown content={briefing.independence_skill} inline /></div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
