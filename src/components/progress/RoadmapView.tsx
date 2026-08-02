"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Compass, Lightbulb, Info } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Card, Eyebrow, PrimaryButton } from "@/components/ui/primitives";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import { STANDARDS_FRAMEWORK, LEARNING_STATE_LABELS, LEARNING_STATE_DESCRIPTIONS, type LearningState } from "@/lib/standards";
import { areaForFocusText, roadmapSummary, derivePatternInsights, type AreaRoadmap } from "@/lib/roadmap";
import type { Subject, LearningPattern } from "@/lib/types";

const STATE_COLORS: Record<LearningState, string> = {
  not_yet_observed: PALETTE.inkFaint,
  introduced: "#6B8CBE",
  developing: PALETTE.gold,
  comfortable: PALETTE.brand,
  ready_to_extend: "#8C6FBE",
};

function StateDot({ state }: { state: LearningState }) {
  return (
    <span
      className="inline-block flex-shrink-0"
      style={{ width: 8, height: 8, borderRadius: "50%", background: STATE_COLORS[state] }}
    />
  );
}

function StateBadge({ state }: { state: LearningState }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: STATE_COLORS[state] }}>
      <StateDot state={state} />
      {LEARNING_STATE_LABELS[state]}
    </span>
  );
}

type Suggestion = { subject: Subject; focus: string; reason: string };

function CurrentFocus({ childId }: { childId: string }) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchOnce() {
      const res = await fetch("/api/suggest-focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();
      if (!data.suggestions?.length) throw new Error("no suggestions");
      return data.suggestions as Suggestion[];
    }
    (async () => {
      try {
        const result = await fetchOnce().catch(() => fetchOnce());
        if (!cancelled) setSuggestions(result.slice(0, 2));
      } catch {
        // honest empty state below — no fabricated focus
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
        Current focus
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading
          ? [0, 1].map((i) => (
              <Card key={i} style={{ marginBottom: 0 }}>
                <div className="p-5 animate-pulse">
                  <div className="h-4 rounded mb-2.5" style={{ width: "40%", background: PALETTE.line }} />
                  <div className="h-5 rounded mb-2" style={{ width: "70%", background: PALETTE.line }} />
                  <div className="h-3 rounded" style={{ width: "90%", background: PALETTE.line }} />
                </div>
              </Card>
            ))
          : suggestions.map((s, i) => {
              const meta = subjectMeta(s.subject);
              const area = areaForFocusText(s.subject, s.focus);
              return (
                <Card key={i} accent={meta.color} style={{ marginBottom: 0 }}>
                  <div className="p-5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: meta.soft, color: meta.color }}>
                      {meta.label}
                    </span>
                    <h3 className="font-serif-display font-bold mt-2 mb-1.5" style={{ fontSize: 17 }}>
                      {s.focus}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: PALETTE.inkSoft }}>
                      {s.reason}
                    </p>
                    {area && (
                      <p className="text-[11px] font-semibold mb-3" style={{ color: PALETTE.inkFaint }}>
                        Roadmap: {meta.label} → {area.area}
                      </p>
                    )}
                    <PrimaryButton
                      onClick={() => {
                        const params = new URLSearchParams({ subject: s.subject, topic: s.focus, reason: s.reason });
                        router.push(`/practice?${params.toString()}`);
                      }}
                    >
                      Build an activity
                    </PrimaryButton>
                  </div>
                </Card>
              );
            })}
      </div>
    </div>
  );
}

function AreaRow({ item, childName }: { item: AreaRoadmap; childName: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showStandard, setShowStandard] = useState(false);
  const [showNextGrade, setShowNextGrade] = useState(false);
  const router = useRouter();
  const { area, state, evidence } = item;

  return (
    <div style={{ borderBottom: `1px solid ${PALETTE.line}` }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold">{area.area}</p>
          <StateBadge state={state} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {evidence.length > 0 && (
            <span className="text-xs" style={{ color: PALETTE.inkFaint }}>
              {evidence.length} evidence item{evidence.length === 1 ? "" : "s"}
            </span>
          )}
          {expanded ? <ChevronDown size={16} color={PALETTE.inkFaint} /> : <ChevronRight size={16} color={PALETTE.inkFaint} />}
        </div>
      </button>

      {expanded && (
        <div className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
                Kindergarten goal
              </p>
              <p className="text-sm">{area.parentWording}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
                {childName}&apos;s current picture
              </p>
              <StateBadge state={state} />
              <p className="text-sm mt-1" style={{ color: PALETTE.inkSoft }}>
                {LEARNING_STATE_DESCRIPTIONS[state]}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: PALETTE.inkFaint }}>
                Next step
              </p>
              <p className="text-sm mb-2" style={{ color: PALETTE.inkSoft }}>
                {state === "comfortable" || state === "ready_to_extend"
                  ? `Ready to build toward: ${area.nextGrade}`
                  : `A short activity in ${area.area.toLowerCase()} would help build evidence here.`}
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
          </div>

          {evidence.length > 0 && (
            <div className="rounded-xl p-3 mb-3" style={{ background: PALETTE.bg }}>
              <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: PALETTE.inkFaint }}>
                Based on
              </p>
              <div className="flex flex-col gap-1.5">
                {evidence.slice(0, 4).map((e, i) => (
                  <div key={i} className="text-xs" style={{ color: PALETTE.inkSoft }}>
                    {e.text} <span style={{ color: PALETTE.inkFaint }}>· <LocalDateLabel iso={e.date} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowStandard((v) => !v)}
              className="text-xs font-bold underline"
              style={{ color: PALETTE.inkSoft }}
            >
              {showStandard ? "Hide formal standard" : "View formal standard"}
            </button>
            <button
              onClick={() => setShowNextGrade((v) => !v)}
              className="text-xs font-bold underline"
              style={{ color: PALETTE.inkSoft }}
            >
              {showNextGrade ? "Hide" : "Looking ahead to next grade"}
            </button>
          </div>

          {showStandard && (
            <div className="mt-2 text-xs" style={{ color: PALETTE.inkFaint }}>
              {area.formalCode ? (
                <>
                  <strong>{area.formalCode}</strong> ({area.domain}) — {area.officialWording}
                </>
              ) : (
                <>{area.domain} — {area.officialWording}</>
              )}
            </div>
          )}
          {showNextGrade && (
            <div className="mt-2 rounded-xl p-3" style={{ background: "#EFEBFA" }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#6B4FA0" }}>
                What this prepares {childName} for
              </p>
              <p className="text-xs" style={{ color: PALETTE.ink }}>
                {area.nextGrade}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubjectRoadmap({ childName, areasBySubject }: { childName: string; areasBySubject: Record<Subject, AreaRoadmap[]> }) {
  const [activeSubject, setActiveSubject] = useState<Subject>("math");
  const items = areasBySubject[activeSubject] ?? [];
  const summary = roadmapSummary(items);

  return (
    <div>
      <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
        Grade-level roadmap
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {SUBJECTS.map((s) => {
          const active = activeSubject === s.key;
          const subjectItems = areasBySubject[s.key] ?? [];
          const subjSummary = roadmapSummary(subjectItems);
          return (
            <button
              key={s.key}
              onClick={() => setActiveSubject(s.key)}
              className="btn-press px-3.5 py-2.5 text-left transition-all duration-150"
              style={{
                borderRadius: RADIUS.sm,
                background: active ? s.color : PALETTE.card,
                border: `1px solid ${active ? s.color : PALETTE.line}`,
              }}
            >
              <p className="text-sm font-bold" style={{ color: active ? "#fff" : PALETTE.ink }}>
                {s.label}
              </p>
              <p className="text-[11px]" style={{ color: active ? "rgba(255,255,255,0.85)" : PALETTE.inkFaint }}>
                {subjSummary.notObserved === subjectItems.length
                  ? "Not enough evidence yet"
                  : `${subjSummary.developing} developing · ${subjSummary.comfortable} comfortable`}
              </p>
            </button>
          );
        })}
      </div>

      <Card style={{ marginBottom: 0 }}>
        <div className="px-5">
          {items.length === 0 ? (
            <p className="text-sm py-4" style={{ color: PALETTE.inkSoft }}>
              No roadmap areas configured for this subject yet.
            </p>
          ) : (
            items.map((item) => <AreaRow key={item.area.id} item={item} childName={childName} />)
          )}
        </div>
        {summary.notObserved > 0 && (
          <div className="px-5 py-3 flex items-start gap-2" style={{ borderTop: `1px solid ${PALETTE.line}` }}>
            <Info size={13} color={PALETTE.inkFaint} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: PALETTE.inkFaint }}>
              &quot;Not yet observed&quot; means Easy doesn&apos;t have enough information — it doesn&apos;t mean {childName}
              {" "}
              can&apos;t do it.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function WhatAppearsToHelp({ patterns }: { patterns: LearningPattern[] }) {
  const insights = derivePatternInsights(patterns).slice(0, 3);
  if (insights.length === 0) return null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb size={13} color={PALETTE.brand} />
          <Eyebrow color={PALETTE.brand}>What appears to help</Eyebrow>
        </div>
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
        <Eyebrow color={PALETTE.gold}>Recent observations</Eyebrow>
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
  childId,
  childName,
  areasBySubject,
  patterns,
}: {
  childId: string;
  childName: string;
  areasBySubject: Record<Subject, AreaRoadmap[]>;
  patterns: LearningPattern[];
}) {
  const allAreas = Object.values(areasBySubject).flat();
  const summary = roadmapSummary(allAreas);

  return (
    <div className="flex flex-col gap-5">
      <Card tint={PALETTE.brandSoft} style={{ marginBottom: 0 }}>
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass size={13} color={PALETTE.brand} />
            <Eyebrow color={PALETTE.brand}>{STANDARDS_FRAMEWORK.grade} · {STANDARDS_FRAMEWORK.name}</Eyebrow>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold mb-2">
            <span style={{ color: PALETTE.brand }}>{summary.comfortable} areas with evidence</span>
            <span style={{ color: PALETTE.gold }}>{summary.developing} developing</span>
            <span style={{ color: PALETTE.inkFaint }}>{summary.notObserved} not yet observed</span>
          </div>
          <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
            Schools may introduce these skills in a different order. Easy uses this roadmap as a reference and adapts it using{" "}
            {childName}&apos;s schoolwork and your observations.
          </p>
        </div>
      </Card>

      <CurrentFocus childId={childId} />
      <SubjectRoadmap childName={childName} areasBySubject={areasBySubject} />
      <WhatAppearsToHelp patterns={patterns} />
      <RecentObservations areasBySubject={areasBySubject} />
    </div>
  );
}
