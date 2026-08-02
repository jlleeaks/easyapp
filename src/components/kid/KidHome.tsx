"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircleHeart } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import type { Session } from "@/lib/types";

const HOLD_MS = 1200;

function HoldToExit() {
  const router = useRouter();
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setHolding(true);
    timerRef.current = setTimeout(() => router.push("/dashboard"), HOLD_MS);
  }
  function cancel() {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className="flex items-center gap-2 text-xs font-semibold select-none"
      style={{ color: PALETTE.inkFaint }}
    >
      <span
        className="relative flex-shrink-0 overflow-hidden"
        style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${PALETTE.inkFaint}` }}
      >
        <span
          className="absolute left-0 bottom-0 w-full"
          style={{
            height: holding ? "100%" : "0%",
            background: PALETTE.inkFaint,
            transition: holding ? `height ${HOLD_MS}ms linear` : "height 120ms ease-out",
          }}
        />
      </span>
      Press and hold for a grown-up
    </button>
  );
}

export function KidHome({ childName, sessions }: { childName: string; sessions: Session[] }) {
  const [active, setActive] = useState<Session | null>(null);
  const [done, setDone] = useState(false);

  const outerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${PALETTE.brandSoft} 0%, ${PALETTE.goldSoft} 45%, ${PALETTE.accentSoft} 100%)`,
    display: "flex",
    justifyContent: "center",
  };
  const shellStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 480,
    padding: "28px 20px 40px",
  };

  if (active) {
    const b = active.briefing;
    const meta = subjectMeta(active.subject);
    return (
      <div style={outerStyle}>
      <div style={shellStyle}>
        <button
          onClick={() => {
            setActive(null);
            setDone(false);
          }}
          className="flex items-center gap-1.5 mb-6 text-sm font-bold"
          style={{ color: PALETTE.inkSoft }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div
          className="flex items-center justify-center mb-4"
          style={{ width: 64, height: 64, borderRadius: RADIUS.lg, background: meta.color, transform: "rotate(-4deg)" }}
        >
          <meta.icon size={28} color="#fff" />
        </div>
        <h1 className="font-serif-display mb-6" style={{ fontSize: 28, fontWeight: 800 }}>
          {active.skill}
        </h1>

        {!done ? (
          <>
            {b.analogies?.length > 0 && (
              <div className="rounded-2xl p-5 mb-4" style={{ background: "#fff" }}>
                <p className="text-xs font-bold uppercase mb-2" style={{ color: PALETTE.gold, letterSpacing: "0.04em" }}>
                  Think about this
                </p>
                {b.analogies.map((a, i) => (
                  <p key={i} className="text-lg font-semibold mb-1.5 last:mb-0" style={{ lineHeight: 1.3 }}>
                    {a}
                  </p>
                ))}
              </div>
            )}

            {b.followup_questions?.length > 0 && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: "#fff" }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircleHeart size={16} color={PALETTE.brand} />
                  <p className="text-xs font-bold uppercase" style={{ color: PALETTE.brand, letterSpacing: "0.04em" }}>
                    Talk about it
                  </p>
                </div>
                {b.followup_questions.map((q, i) => (
                  <p key={i} className="text-lg font-semibold mb-1.5 last:mb-0" style={{ lineHeight: 1.3 }}>
                    {q}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={() => setDone(true)}
              className="btn-press w-full py-4 rounded-2xl font-bold text-lg"
              style={{ background: PALETTE.brand, color: "#fff" }}
            >
              Mark as done
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-10">
            <p className="font-serif-display" style={{ fontSize: 22, fontWeight: 800 }}>
              Marked as done.
            </p>
            <p className="text-sm mt-1.5" style={{ color: PALETTE.inkSoft }}>
              Tell a grown-up how it went.
            </p>
          </div>
        )}
      </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
    <div style={shellStyle}>
      <h1 className="font-serif-display mb-1.5" style={{ fontSize: 30, fontWeight: 800 }}>
        {childName}&apos;s activities
      </h1>
      <p className="text-sm mb-6" style={{ color: PALETTE.inkSoft }}>
        Pick one below.
      </p>

      {sessions.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff" }}>
          <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
            Nothing here yet. Ask a grown-up to add something.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {sessions.map((s) => {
            const meta = subjectMeta(s.subject);
            return (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className="btn-press flex items-center gap-3.5 p-4 rounded-2xl text-left"
                style={{ background: "#fff" }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 46, height: 46, borderRadius: RADIUS.sm, background: meta.color, transform: "rotate(-5deg)" }}
                >
                  <meta.icon size={21} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-lg font-bold block">{s.skill}</span>
                  <span className="text-xs font-semibold" style={{ color: PALETTE.inkFaint }}>
                    <LocalDateLabel iso={s.created_at} options={{ month: "short", day: "numeric" }} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <HoldToExit />
    </div>
    </div>
  );
}
