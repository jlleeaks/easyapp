"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { Card, Eyebrow } from "@/components/ui/primitives";
import type { Subject } from "@/lib/types";

type Suggestion = { subject: Subject; focus: string; reason: string };

export function NextStepsCard({ childId }: { childId: string }) {
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
        if (!cancelled) setSuggestions(result);
      } catch {
        // fail silently — card just won't render
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
    <Card style={{ marginBottom: 0 }}>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Compass size={13} color={PALETTE.brand} />
          <Eyebrow color={PALETTE.brand}>Suggested next steps</Eyebrow>
        </div>
        {loading ? (
          <div className="animate-pulse flex flex-col gap-2.5">
            <div className="h-14 rounded-xl" style={{ background: PALETTE.line }} />
            <div className="h-14 rounded-xl" style={{ background: PALETTE.line }} />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {suggestions.slice(0, 3).map((s, i) => {
              const meta = subjectMeta(s.subject);
              return (
                <Link
                  key={i}
                  href={`/practice?subject=${s.subject}`}
                  className="btn-press flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                  style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 32, height: 32, borderRadius: 10, background: meta.color, transform: "rotate(-5deg)" }}
                  >
                    <meta.icon size={14} color="#fff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{s.focus}</p>
                    <p className="text-xs truncate" style={{ color: PALETTE.inkSoft }}>
                      {s.reason}
                    </p>
                  </div>
                  <ArrowRight size={14} color={PALETTE.inkFaint} className="flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
