"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Target } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { PrimaryButton } from "@/components/ui/primitives";
import { NumericProgressBar } from "@/components/ui/MilestoneProgressBar";
import { thisWeekCounts, thisWeekCountBySubject, WEEKLY_SUBJECT_TARGET } from "@/lib/streak";
import { subjectMeta } from "@/lib/subjects";
import type { SuggestedWeeklyGoals } from "@/lib/suggestions";
import type { StandardArea } from "@/lib/standards";
import type { Session, Subject, WeeklyGoals } from "@/lib/types";

type OtherActivity = { subject: Subject; focus: string; reason: string; area: StandardArea | null };

function OtherActivityCard({ activity, count, onStart }: { activity: OtherActivity; count: number; onStart: () => void }) {
  const meta = subjectMeta(activity.subject);
  return (
    <div className="rounded-xl p-3" style={{ background: meta.soft, border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "#fff", color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: PALETTE.inkSoft }}>
          {count} of {WEEKLY_SUBJECT_TARGET} this week
        </span>
      </div>
      <p className="text-sm font-bold leading-snug mb-0.5" style={{ color: PALETTE.ink }}>
        {activity.focus}
      </p>
      <p className="text-xs italic mb-2" style={{ color: meta.color }}>
        Builds toward {meta.label}
      </p>
      <NumericProgressBar observed={count} total={WEEKLY_SUBJECT_TARGET} fillColor={meta.color} />
      <button onClick={onStart} className="text-xs font-bold underline mt-2" style={{ color: meta.color }}>
        Start this instead
      </button>
    </div>
  );
}

function GoalRow({ label, count, target }: { label: string; count: number; target: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs font-semibold" style={{ color: PALETTE.ink }}>
          {label}
        </p>
        <p className="text-xs font-bold" style={{ color: PALETTE.inkSoft }}>
          {count} of {target}
        </p>
      </div>
      <NumericProgressBar observed={count} total={target} />
    </div>
  );
}

function GoalInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: PALETTE.ink }}>
        {label}
      </label>
      <input
        type="number"
        min={0}
        max={14}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(14, Number(e.target.value) || 0)))}
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ borderRadius: RADIUS.sm, border: `1.5px solid ${PALETTE.line}`, background: "#fff" }}
      />
    </div>
  );
}

function FocusInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: PALETTE.ink }}>
        What do you want to build toward this week? <span style={{ color: PALETTE.inkFaint, fontWeight: 400 }}>(optional)</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 200))}
        placeholder="e.g. longer sentences, or asking for help more confidently"
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ borderRadius: RADIUS.sm, border: `1.5px solid ${PALETTE.line}`, background: "#fff" }}
      />
    </div>
  );
}

export function WeeklyGoalsCard({
  childId,
  childName,
  weeklyGoals,
  suggestedGoals,
  otherActivities,
  sessions,
}: {
  childId: string;
  childName: string;
  weeklyGoals: WeeklyGoals | null;
  suggestedGoals: SuggestedWeeklyGoals | null;
  otherActivities: OtherActivity[];
  sessions: Session[];
}) {
  const router = useRouter();

  function startOther(activity: OtherActivity) {
    const params = new URLSearchParams({ subject: activity.subject, topic: activity.focus, reason: activity.reason });
    router.push(`/practice?${params.toString()}`);
  }
  const [goals, setGoals] = useState(weeklyGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ read_together_target: 5, practice_target: 3, homework_target: 3, focus_area: "" });
  const [suggestReason, setSuggestReason] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReason, setShowReason] = useState(false);

  const counts = thisWeekCounts(sessions);

  // The parent hasn't saved their own goals yet — show Easy's personalized, roadmap-grounded
  // default directly instead of an empty "set them yourself" form. It isn't persisted until
  // they explicitly save (via Edit goals), so it can stay fresh as their data changes.
  const isSuggested = !goals && !!suggestedGoals;
  const effectiveGoals = goals ?? suggestedGoals;

  function startEditing() {
    const base = goals ?? suggestedGoals;
    if (base) {
      setDraft({
        read_together_target: base.read_together_target,
        practice_target: base.practice_target,
        homework_target: base.homework_target,
        focus_area: goals?.focus_area ?? "",
      });
    }
    setSuggestReason(null);
    setError(null);
    setShowReason(false);
    setEditing(true);
  }

  async function suggestForMe() {
    setSuggesting(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest-weekly-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't suggest goals — try again.");
        return;
      }
      setDraft((d) => ({
        ...d,
        read_together_target: data.read_together_target,
        practice_target: data.practice_target,
        homework_target: data.homework_target,
      }));
      setSuggestReason(data.reason ?? null);
    } catch {
      setError("Couldn't reach Easy — check your connection and try again.");
    } finally {
      setSuggesting(false);
    }
  }

  async function saveGoals() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/weekly-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save those goals — try again.");
        return;
      }
      setGoals(data.weeklyGoals);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Couldn't reach Easy — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
        <p className="text-xs font-bold uppercase mb-3" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          Set weekly goals
        </p>
        <div className="flex flex-col gap-3 mb-3">
          <GoalInput label="Read together (times)" value={draft.read_together_target} onChange={(v) => setDraft((d) => ({ ...d, read_together_target: v }))} />
          <GoalInput label="Practice activities" value={draft.practice_target} onChange={(v) => setDraft((d) => ({ ...d, practice_target: v }))} />
          <GoalInput label="Homework completed" value={draft.homework_target} onChange={(v) => setDraft((d) => ({ ...d, homework_target: v }))} />
          <FocusInput value={draft.focus_area} onChange={(v) => setDraft((d) => ({ ...d, focus_area: v }))} />
        </div>
        <button
          onClick={suggestForMe}
          disabled={suggesting}
          className="btn-press flex items-center justify-center gap-1.5 text-xs font-bold py-2 mb-2 transition-all duration-150"
          style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.brandLine}`, color: PALETTE.brand, background: PALETTE.brandSoft }}
        >
          <Sparkles size={13} /> {suggesting ? "Thinking…" : "Get a fresh suggestion"}
        </button>
        {suggestReason && (
          <p className="text-xs italic mb-2" style={{ color: PALETTE.inkSoft }}>
            {suggestReason}
          </p>
        )}
        {error && (
          <p className="text-xs mb-2" style={{ color: PALETTE.accent }}>
            {error}
          </p>
        )}
        <div className="flex gap-2 mt-auto pt-1">
          <PrimaryButton onClick={saveGoals} disabled={saving}>
            {saving ? "Saving…" : "Save goals"}
          </PrimaryButton>
          <button
            onClick={() => setEditing(false)}
            className="text-sm font-semibold px-3"
            style={{ color: PALETTE.inkSoft }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!effectiveGoals) {
    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
        <p className="text-xs font-bold uppercase mb-3" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          This week
        </p>
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
          <Target size={20} color={PALETTE.inkFaint} />
          <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
            Set weekly goals for {childName} — reading together, practice, and homework — so Home can show real
            progress against them.
          </p>
        </div>
        <button
          onClick={startEditing}
          className="btn-press text-sm font-bold py-2.5 mt-3 transition-all duration-150"
          style={{ borderRadius: RADIUS.sm, background: PALETTE.brand, color: "#fff" }}
        >
          Set weekly goals
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          This week
        </p>
        <button onClick={startEditing} className="text-xs font-bold underline" style={{ color: PALETTE.brand }}>
          Edit goals
        </button>
      </div>
      {isSuggested && (
        <div className="mb-3">
          <button
            onClick={() => setShowReason((v) => !v)}
            className="text-xs font-semibold underline"
            style={{ color: PALETTE.inkFaint }}
          >
            Personalized for {childName} — Suggestions?
          </button>
          {showReason && (
            <p className="text-xs italic mt-1" style={{ color: PALETTE.inkSoft }}>
              {suggestedGoals!.reason}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-4" style={{ marginTop: isSuggested ? 0 : 12 }}>
        <GoalRow label="Read together" count={counts.library ?? 0} target={effectiveGoals.read_together_target} />
        <div>
          <GoalRow label="Practice activities" count={counts.practice ?? 0} target={effectiveGoals.practice_target} />
          {otherActivities.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-2">
              <p className="text-xs" style={{ color: PALETTE.inkFaint }}>
                Rather not do tonight&apos;s pick? These count toward this goal too:
              </p>
              {otherActivities.map((a) => (
                <OtherActivityCard
                  key={`${a.subject}-${a.focus}`}
                  activity={a}
                  count={thisWeekCountBySubject(sessions, a.subject)}
                  onStart={() => startOther(a)}
                />
              ))}
            </div>
          )}
        </div>
        <GoalRow label="Homework completed" count={counts.homework ?? 0} target={effectiveGoals.homework_target} />
      </div>
      {goals?.focus_area && (
        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${PALETTE.line}` }}>
          <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: PALETTE.inkFaint }}>
            Building toward this week
          </p>
          <p className="text-sm font-semibold" style={{ color: PALETTE.ink }}>
            {goals.focus_area}
          </p>
        </div>
      )}
    </div>
  );
}
