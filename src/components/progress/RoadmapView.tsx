"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Lightbulb, Info } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Card, PrimaryButton } from "@/components/ui/primitives";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateMarker } from "@/components/ui/StateMarker";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import { LEARNING_STATE_DESCRIPTIONS } from "@/lib/standards";
import { roadmapSummary, derivePatternInsights, type AreaRoadmap } from "@/lib/roadmap";
import type { Subject, LearningPattern } from "@/lib/types";

function AreaDetail({ item, childName }: { item: AreaRoadmap; childName: string }) {
  const router = useRouter();
  const [showWhy, setShowWhy] = useState(false);
  const [showStandard, setShowStandard] = useState(false);
  const [showNextGrade, setShowNextGrade] = useState(false);
  const { area, state, evidence } = item;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
      <div>
        <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
          Kindergarten goal
        </p>
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>{area.parentWording}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
          {childName} right now
        </p>
        <StateMarker state={state} />
        <p className="text-sm mt-1" style={{ color: PALETTE.inkSoft }}>
          {evidence[0]?.text ?? LEARNING_STATE_DESCRIPTIONS[state]}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
          Recommended next step
        </p>
        <p className="text-sm mb-2" style={{ color: PALETTE.inkSoft }}>
          {state === "comfortable" || state === "ready_to_extend" ? area.nextGrade : `A short activity in ${area.area.toLowerCase()}.`}
        </p>
        <button
          onClick={() => {
            const params = new URLSearchParams({ subject: area.subject, topic: area.area });
            router.push(`/practice?${params.toString()}`);
          }}
          className="text-xs font-bold underline"
          style={{ color: PALETTE.brand }}
        >
          Build this activity
        </button>
      </div>

      <div className="md:col-span-3 flex flex-wrap gap-4 pt-1">
        {evidence.length > 0 && (
          <button onClick={() => setShowWhy((v) => !v)} className="text-xs font-bold underline" style={{ color: PALETTE.inkSoft }}>
            {showWhy ? "Hide" : "Why Easy thinks this"}
          </button>
        )}
        <button onClick={() => setShowStandard((v) => !v)} className="text-xs font-bold underline" style={{ color: PALETTE.inkSoft }}>
          {showStandard ? "Hide" : "View formal standard"}
        </button>
        <button onClick={() => setShowNextGrade((v) => !v)} className="text-xs font-bold underline" style={{ color: PALETTE.inkSoft }}>
          {showNextGrade ? "Hide" : "Looking ahead to next grade"}
        </button>
      </div>

      {showWhy && (
        <div className="md:col-span-3 rounded-xl p-3" style={{ background: PALETTE.bg }}>
          <div className="flex flex-col gap-1.5">
            {evidence.slice(0, 4).map((e, i) => (
              <div key={i} className="text-xs" style={{ color: PALETTE.inkSoft }}>
                {e.text} <span style={{ color: PALETTE.inkFaint }}>· <LocalDateLabel iso={e.date} /></span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showStandard && (
        <div className="md:col-span-3 text-xs" style={{ color: PALETTE.inkFaint }}>
          {area.formalCode ? (
            <><strong>{area.formalCode}</strong> ({area.domain}) — {area.officialWording}</>
          ) : (
            <>{area.domain} — {area.officialWording}</>
          )}
        </div>
      )}
      {showNextGrade && (
        <div className="md:col-span-3 rounded-xl p-3" style={{ background: PALETTE.violetSoft }}>
          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.violetDeep }}>
            What this prepares {childName} for
          </p>
          <p className="text-xs" style={{ color: PALETTE.ink }}>{area.nextGrade}</p>
        </div>
      )}
    </div>
  );
}

function ObservedRow({ item, childName }: { item: AreaRoadmap; childName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${PALETTE.line}` }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 py-3.5 text-left" aria-expanded={open}>
        <div className="min-w-0">
          <p className="text-sm font-bold mb-0.5">{item.area.area}</p>
          <StateMarker state={item.state} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-xs font-bold" style={{ color: PALETTE.brand }}>
          {open ? "Hide" : "View details"}
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
      </button>
      {!open && item.evidence[0] && (
        <p className="text-sm pb-3 -mt-2" style={{ color: PALETTE.inkSoft }}>{item.evidence[0].text}</p>
      )}
      {open && <AreaDetail item={item} childName={childName} />}
    </div>
  );
}

function SubjectRoadmap({ childName, areasBySubject }: { childName: string; areasBySubject: Record<Subject, AreaRoadmap[]> }) {
  const [activeSubject, setActiveSubject] = useState<Subject>("math");
  const [showAllGoals, setShowAllGoals] = useState(false);
  const items = areasBySubject[activeSubject] ?? [];
  const observed = items.filter((a) => a.evidence.length > 0);
  const notObserved = items.filter((a) => a.evidence.length === 0);
  const meta = subjectMeta(activeSubject);

  // "Recommended next step": the not-yet-comfortable area with the most evidence (closest to a level up),
  // falling back to the first not-yet-observed area so there's always something concrete to try.
  const nextStepArea =
    [...observed].filter((a) => a.state !== "comfortable" && a.state !== "ready_to_extend").sort((a, b) => b.evidence.length - a.evidence.length)[0] ??
    notObserved[0] ??
    null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {SUBJECTS.map((s) => {
          const active = activeSubject === s.key;
          const subjectItems = areasBySubject[s.key] ?? [];
          const summary = roadmapSummary(subjectItems);
          return (
            <button
              key={s.key}
              onClick={() => {
                setActiveSubject(s.key);
                setShowAllGoals(false);
              }}
              className="btn-press flex items-center gap-2.5 px-4 py-3 text-left transition-all duration-150"
              style={{
                borderRadius: RADIUS.md,
                background: active ? s.color : PALETTE.card,
                border: `1.5px solid ${active ? s.color : PALETTE.line}`,
                minWidth: 150,
              }}
            >
              <s.icon size={18} color={active ? "#fff" : s.color} />
              <div>
                <p className="text-sm font-bold" style={{ color: active ? "#fff" : PALETTE.ink }}>{s.label}</p>
                <p className="text-[11px]" style={{ color: active ? "rgba(255,255,255,0.85)" : PALETTE.inkFaint }}>
                  {summary.withEvidence === 0 ? "Not enough evidence" : `${summary.withEvidence} observed · ${summary.comfortable} comfortable`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <meta.icon size={16} color={meta.color} />
        <h3 className="font-serif-display font-bold" style={{ fontSize: 20 }}>{meta.label}</h3>
      </div>
      <p className="text-sm mb-5" style={{ color: PALETTE.inkSoft }}>
        {observed.length === 0
          ? `Easy hasn't observed a ${meta.label.toLowerCase()} area yet.`
          : `${childName} is developing ${observed.length} observed ${meta.label.toLowerCase()} area${observed.length === 1 ? "" : "s"}.`}
      </p>

      {observed.length > 0 && (
        <div className="mb-5">
          <SectionHeading>What Easy has observed</SectionHeading>
          <Card style={{ marginBottom: 0 }}>
            <div className="px-5">
              {observed.map((item) => (
                <ObservedRow key={item.area.id} item={item} childName={childName} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {nextStepArea && (
        <div className="mb-5">
          <SectionHeading color={meta.color}>Recommended next step</SectionHeading>
          <div className="rounded-2xl p-4" style={{ background: meta.soft }}>
            <p className="text-sm font-bold mb-1">{nextStepArea.area.area}</p>
            <p className="text-sm mb-3" style={{ color: PALETTE.ink }}>
              {nextStepArea.evidence[0]?.text ?? `A good place to start in ${meta.label.toLowerCase()}.`}
            </p>
            <PrimaryButton
              onClick={() => {
                window.location.href = `/practice?subject=${nextStepArea.area.subject}&topic=${encodeURIComponent(nextStepArea.area.area)}`;
              }}
            >
              Build this activity
            </PrimaryButton>
          </div>
        </div>
      )}

      {notObserved.length > 0 && (
        <div>
          <SectionHeading>Other kindergarten {meta.label.toLowerCase()} goals</SectionHeading>
          {!showAllGoals ? (
            <button
              onClick={() => setShowAllGoals(true)}
              className="text-sm underline"
              style={{ color: PALETTE.inkSoft }}
            >
              Easy has not observed {notObserved.length} other {meta.label.toLowerCase()} area{notObserved.length === 1 ? "" : "s"} yet — view all goals
            </button>
          ) : (
            <Card style={{ marginBottom: 0 }}>
              <div className="px-5">
                {notObserved.map((item, i) => (
                  <div
                    key={item.area.id}
                    className="flex items-center justify-between gap-3 py-3"
                    style={{ borderTop: i > 0 ? `1px solid ${PALETTE.line}` : "none" }}
                  >
                    <p className="text-sm font-semibold">{item.area.area}</p>
                    <StateMarker state={item.state} />
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 flex items-start gap-2" style={{ borderTop: `1px solid ${PALETTE.line}` }}>
                <Info size={13} color={PALETTE.inkFaint} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: PALETTE.inkFaint }}>
                  &quot;Not yet observed&quot; means Easy doesn&apos;t have enough information
                  {" "}
                  — it doesn&apos;t mean {childName} can&apos;t do it.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function WhatAppearsToHelp({ patterns }: { patterns: LearningPattern[] }) {
  const insights = derivePatternInsights(patterns).slice(0, 3);
  if (insights.length === 0) return null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <SectionHeading icon={<Lightbulb size={15} color={PALETTE.brand} />} color={PALETTE.brand}>
          What appears to help
        </SectionHeading>
        <div className="flex flex-col gap-2.5">
          {insights.map((i, idx) => (
            <div key={idx} className="text-sm">
              <span style={{ color: PALETTE.ink }}>{i.text.charAt(0).toUpperCase() + i.text.slice(1)}</span>
              <span className="text-xs ml-1.5" style={{ color: PALETTE.inkFaint }}>
                Based on {i.count} check-in{i.count === 1 ? "" : "s"}
                {i.confirmed ? " · Parent confirmed" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecentObservations({ areasBySubject }: { areasBySubject: Record<Subject, AreaRoadmap[]> }) {
  const bullets: { subject: Subject; text: string; count: number }[] = [];
  for (const subject of SUBJECTS.map((s) => s.key)) {
    const items = (areasBySubject[subject] ?? []).filter((a) => a.evidence.length > 0);
    if (items.length === 0) continue;
    const mostEvidenced = items.reduce((a, b) => (b.evidence.length > a.evidence.length ? b : a));
    bullets.push({ subject, text: mostEvidenced.evidence[0].text, count: mostEvidenced.evidence.length });
  }
  if (bullets.length === 0) return null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <SectionHeading color={PALETTE.gold}>Recent observations</SectionHeading>
        <p className="text-xs mb-3" style={{ color: PALETTE.inkFaint }}>
          Easy needs more than one observation before identifying a reliable long-term change.
        </p>
        <div className="flex flex-col gap-2">
          {bullets.map((b, i) => {
            const meta = subjectMeta(b.subject);
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: meta.soft, color: meta.color }}>
                  {meta.label}
                </span>
                <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
                  {b.text} <span style={{ color: PALETTE.inkFaint }}>· based on {b.count} item{b.count === 1 ? "" : "s"}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export function RoadmapView({
  childName,
  areasBySubject,
  patterns,
}: {
  childName: string;
  areasBySubject: Record<Subject, AreaRoadmap[]>;
  patterns: LearningPattern[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <SubjectRoadmap childName={childName} areasBySubject={areasBySubject} />
      <WhatAppearsToHelp patterns={patterns} />
      <RecentObservations areasBySubject={areasBySubject} />
    </div>
  );
}
