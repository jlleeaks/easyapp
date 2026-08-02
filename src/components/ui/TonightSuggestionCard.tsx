"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { Card } from "@/components/ui/primitives";
import type { Subject } from "@/lib/types";

type Suggestion = { subject: Subject; focus: string; reason: string };

export function TonightSuggestionCard({ childId }: { childId: string }) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      const res = await fetch("/api/suggest-focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();
      if (!data.suggestions?.[0]) throw new Error("no suggestions");
      return data.suggestions[0] as Suggestion;
    }

    (async () => {
      try {
        const first = await fetchOnce().catch(() => fetchOnce());
        if (!cancelled) setSuggestion(first);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  if (failed) return null;

  const meta = suggestion ? subjectMeta(suggestion.subject) : null;

  return (
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} color={PALETTE.gold} />
          <p className="text-[11px] font-bold uppercase" style={{ color: PALETTE.gold, letterSpacing: "0.04em" }}>
            Tonight, Easy would try
          </p>
        </div>
        {loading || !suggestion || !meta ? (
          <div className="animate-pulse mt-2.5">
            <div className="h-4 rounded mb-2.5" style={{ width: "55%", background: PALETTE.line }} />
            <div className="h-3 rounded" style={{ width: "85%", background: PALETTE.line }} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-1.5 mb-1.5">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 28, height: 28, borderRadius: 9, background: meta.color, transform: "rotate(-6deg)" }}
              >
                <meta.icon size={14} color="#fff" />
              </div>
              <p className="font-serif-display font-bold" style={{ fontSize: 17 }}>
                {suggestion.focus}
              </p>
            </div>
            <p className="text-sm mb-3.5 leading-snug" style={{ color: PALETTE.inkSoft }}>
              {suggestion.reason}
            </p>
            <Link
              href={`/practice?subject=${suggestion.subject}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold"
              style={{ color: meta.color }}
            >
              <span className="inline-flex items-center gap-1.5">
                Build this lesson <ArrowRight size={13} />
              </span>
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
