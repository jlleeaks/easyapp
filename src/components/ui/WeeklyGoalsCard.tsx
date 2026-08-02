"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Target } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { PrimaryButton } from "@/components/ui/primitives";
import { NumericProgressBar } from "@/components/ui/MilestoneProgressBar";
import { thisWeekCounts } from "@/lib/streak";
import type { Session, WeeklyGoals } from "@/lib/types";

const METRICS: { key: keyof Omit<WeeklyGoals, "updated_at">; label: string; source: Session["source"] }[] = [
  { key: "read_together_target", label: "Read together", source: "library" },
  { key: "practice_target", label: "Practice activities", source: "practice" },
  { key: "homework_target", label: "Homework completed", source: "homework" },
];

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

export function WeeklyGoalsCard({
  childId,
  childName,
  weeklyGoals,
  sessions,
}: {
  childId: string;
  childName: string;
  weeklyGoals: WeeklyGoals | null;
  sessions: Session[];
}) {
  const router = useRouter();
  const [goals, setGoals] = useState(weeklyGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ read_together_target: 5, practice_target: 3, homework_target: 3 });
  const [suggestReason, setSuggestReason] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = thisWeekCounts(sessions);

  function startEditing() {
    if (goals) {
      setDraft({
        read_together_target: goals.read_together_target,
        practice_target: goals.practice_target,
        homework_target: goals.homework_target,
      });
    }
    setSuggestReason(null);
    setError(null);
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
      setDraft({
        read_together_target: data.read_together_target,
        practice_target: data.practice_target,
        homework_target: data.homework_target,
      });
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
        </div>
        <button
          onClick={suggestForMe}
          disabled={suggesting}
          className="btn-press flex items-center justify-center gap-1.5 text-xs font-bold py-2 mb-2 transition-all duration-150"
          style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.brandLine}`, color: PALETTE.brand, background: PALETTE.brandSoft }}
        >
          <Sparkles size={13} /> {suggesting ? "Thinking…" : "Suggest for me"}
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

  if (!goals) {
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
          This week
        </p>
        <button onClick={startEditing} className="text-xs font-bold underline" style={{ color: PALETTE.brand }}>
          Edit goals
        </button>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {METRICS.map((m) => (
          <GoalRow key={m.key} label={m.label} count={counts[m.source] ?? 0} target={goals[m.key]} />
        ))}
      </div>
    </div>
  );
}
