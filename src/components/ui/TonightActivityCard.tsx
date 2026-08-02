"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { Card, Eyebrow, PrimaryButton } from "@/components/ui/primitives";
import { areaForFocusText } from "@/lib/roadmap";
import type { Subject } from "@/lib/types";

type Suggestion = { subject: Subject; focus: string; reason: string };

export function TonightActivityCard({ childId, childName }: { childId: string; childName: string }) {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [starting, setStarting] = useState(false);

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

  function start() {
    if (!suggestion) return;
    setStarting(true);
    const params = new URLSearchParams({ subject: suggestion.subject, topic: suggestion.focus, reason: suggestion.reason });
    router.push(`/practice?${params.toString()}`);
  }

  const meta = suggestion ? subjectMeta(suggestion.subject) : null;

  // Honest fallback: don't invent a personalized pick when generation failed —
  // still give the parent a way to start something, just not falsely tailored.
  if (failed) {
    return (
      <Card tint={PALETTE.goldSoft} style={{ marginBottom: 0 }}>
        <div className="p-6">
          <Eyebrow color={PALETTE.gold}>Tonight</Eyebrow>
          <h2 className="font-serif-display font-bold mt-1 mb-2" style={{ fontSize: 22 }}>
            What should we do with {childName} tonight?
          </h2>
          <p className="text-sm mb-4" style={{ color: PALETTE.inkSoft }}>
            Easy couldn&apos;t put together a personalized pick right now — pick one of the paths below instead.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card tint={PALETTE.goldSoft} style={{ marginBottom: 0 }}>
      <div className="p-6">
        <Eyebrow color={PALETTE.gold}>Tonight&apos;s activity</Eyebrow>
        {loading || !suggestion || !meta ? (
          <div className="animate-pulse mt-3">
            <div className="h-6 rounded mb-3" style={{ width: "60%", background: PALETTE.line }} />
            <div className="h-4 rounded mb-2" style={{ width: "90%", background: PALETTE.line }} />
            <div className="h-4 rounded" style={{ width: "40%", background: PALETTE.line }} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mt-2 mb-2.5">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 44, height: 44, borderRadius: RADIUS.sm, background: meta.color, transform: "rotate(-5deg)" }}
              >
                <meta.icon size={20} color="#fff" />
              </div>
              <h2 className="font-serif-display font-bold" style={{ fontSize: 23, lineHeight: 1.2 }}>
                {suggestion.focus}
              </h2>
            </div>
            <p className="text-sm mb-3" style={{ color: PALETTE.inkSoft }}>
              A short activity built around what {childName} already loves.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold" style={{ color: PALETTE.inkFaint }}>
              <span className="px-2.5 py-1 rounded-full" style={{ background: meta.soft, color: meta.color }}>
                {meta.label}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> About 5-10 minutes
              </span>
              <span>No printing needed</span>
            </div>
            {(() => {
              const area = areaForFocusText(suggestion.subject, suggestion.focus);
              return area ? (
                <p className="text-[11px] font-semibold mb-3" style={{ color: PALETTE.inkFaint }}>
                  Roadmap focus: {meta.label} → {area.area}
                </p>
              ) : null;
            })()}
            <div className="rounded-xl p-3.5 mb-4" style={{ background: "#fff" }}>
              <p className="text-[11px] font-bold uppercase mb-1" style={{ color: PALETTE.gold, letterSpacing: "0.04em" }}>
                Why this tonight
              </p>
              <p className="text-sm" style={{ color: PALETTE.ink }}>
                {suggestion.reason}
              </p>
            </div>
            <PrimaryButton onClick={start} disabled={starting}>
              {starting ? "Starting…" : "Start activity"}
            </PrimaryButton>
          </>
        )}
      </div>
    </Card>
  );
}

export function SecondaryActionLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="btn-press flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-all duration-150"
      style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}`, background: PALETTE.card, color: PALETTE.ink }}
    >
      {icon}
      {label}
    </Link>
  );
}
