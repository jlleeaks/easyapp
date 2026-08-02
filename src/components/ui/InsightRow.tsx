"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import type { ProfileInsight, LearningPattern, InsightSource } from "@/lib/types";

export const SOURCE_LABELS: Record<InsightSource, string> = {
  report_card: "Report card",
  assignment: "Graded assignment",
  session: "Easy observation",
  teacher: "Teacher",
  parent: "Parent",
};

type Item = ProfileInsight | LearningPattern;
type Field = "strengths" | "growth_areas" | "learning_patterns";

function itemText(item: Item): string {
  return "observation" in item ? item.observation : item.text;
}

export function InsightRow({
  childId,
  field,
  item,
  onChange,
}: {
  childId: string;
  field: Field;
  item: Item;
  onChange: (items: Item[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(itemText(item));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAct = Boolean(item.id);
  const isPattern = "observation" in item;

  async function act(action: "confirm" | "correct" | "remove", text?: string) {
    if (!item.id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, field, id: item.id, action, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save that — try again.");
        return;
      }
      onChange(data.items);
      setEditing(false);
    } catch {
      setError("Couldn't save that — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="py-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm outline-none mb-2"
          style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}`, background: PALETTE.card }}
        />
        {error && (
          <div className="text-xs mb-2" style={{ color: PALETTE.accent }}>
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => act("correct", draft)}
            disabled={busy || !draft.trim()}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: PALETTE.brand, color: "#fff" }}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setDraft(itemText(item));
              setError(null);
            }}
            className="text-xs font-semibold px-3 py-1.5"
            style={{ color: PALETTE.inkSoft }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm" style={{ color: PALETTE.ink }}>
          {itemText(item)}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[11px]" style={{ color: PALETTE.inkFaint }}>
            {SOURCE_LABELS[item.source]}
          </span>
          <span style={{ color: PALETTE.inkFaint }}>·</span>
          <span className="text-[11px]" style={{ color: PALETTE.inkFaint }}>
            <LocalDateLabel iso={item.created_at} />
          </span>
          {item.confirmed === "confirmed" && (
            <span className="text-[11px] font-semibold" style={{ color: PALETTE.brand }}>
              · Confirmed
            </span>
          )}
          {isPattern && (item as LearningPattern).parent_response && (
            <span className="text-[11px]" style={{ color: PALETTE.inkFaint }}>
              · Tried: {(item as LearningPattern).parent_response}
            </span>
          )}
        </div>
        {error && !editing && (
          <div className="text-xs mt-1" style={{ color: PALETTE.accent }}>
            {error}
          </div>
        )}
      </div>
      {canAct && (
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {item.confirmed !== "confirmed" && (
            <button onClick={() => act("confirm")} disabled={busy} aria-label="That sounds right" title="That sounds right">
              <Check size={14} color={PALETTE.brand} />
            </button>
          )}
          <button onClick={() => setEditing(true)} disabled={busy} aria-label="Correct this" title="Correct this">
            <Pencil size={13} color={PALETTE.inkFaint} />
          </button>
          <button onClick={() => act("remove")} disabled={busy} aria-label="Remove this" title="Remove this">
            <X size={14} color={PALETTE.accent} />
          </button>
        </div>
      )}
    </div>
  );
}
