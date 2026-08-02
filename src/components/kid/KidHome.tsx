"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PartyPopper, MessageCircleHeart } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { subjectMeta } from "@/lib/subjects";
import type { Session } from "@/lib/types";

function randomGateQuestion() {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 6);
  return { a, b, sum: a + b };
}

export function KidHome({ childName, sessions }: { childName: string; sessions: Session[] }) {
  const router = useRouter();
  const [active, setActive] = useState<Session | null>(null);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gateAnswer, setGateAnswer] = useState("");
  const [gateWrong, setGateWrong] = useState(false);
  const [gateQuestion, setGateQuestion] = useState(randomGateQuestion);

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

  if (exiting) {
    return (
      <div style={outerStyle}>
        <div style={{ ...shellStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div className="font-serif-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
            Ask a grown-up for help! 🙋
          </div>
          <p className="text-sm mb-5" style={{ color: PALETTE.inkSoft, maxWidth: 260 }}>
            What&apos;s {gateQuestion.a} + {gateQuestion.b}?
          </p>
          <input
            value={gateAnswer}
            onChange={(e) => {
              setGateAnswer(e.target.value);
              setGateWrong(false);
            }}
            inputMode="numeric"
            className="text-center text-2xl font-bold outline-none mb-4"
            style={{ width: 100, padding: "10px 0", borderRadius: RADIUS.sm, border: `2px solid ${gateWrong ? PALETTE.accent : PALETTE.line}`, background: "#fff" }}
          />
          {gateWrong && (
            <p className="text-xs mb-3" style={{ color: PALETTE.accent }}>
              Not quite — try again!
            </p>
          )}
          <div className="flex flex-col gap-2.5" style={{ width: 220 }}>
            <button
              onClick={() => {
                if (Number(gateAnswer) === gateQuestion.sum) {
                  router.push("/dashboard");
                } else {
                  setGateWrong(true);
                  setGateAnswer("");
                  setGateQuestion(randomGateQuestion());
                }
              }}
              className="btn-press py-3 rounded-2xl font-bold text-sm"
              style={{ background: PALETTE.brand, color: "#fff" }}
            >
              Go back
            </button>
            <button
              onClick={() => setExiting(false)}
              className="btn-press py-3 rounded-2xl font-bold text-sm"
              style={{ background: "#fff", color: PALETTE.inkSoft, border: `1px solid ${PALETTE.line}` }}
            >
              Never mind
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              I did it! 🎉
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-10">
            <PartyPopper size={48} color={PALETTE.gold} />
            <p className="font-serif-display mt-4" style={{ fontSize: 22, fontWeight: 800 }}>
              Great job, {childName}!
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
        Hi {childName}! 👋
      </h1>
      <p className="text-sm mb-6" style={{ color: PALETTE.inkSoft }}>
        Pick something to do:
      </p>

      {sessions.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff" }}>
          <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
            Nothing here yet — ask a grown-up to add something for you!
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
                <span className="text-lg font-bold">{s.skill}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => {
          setGateQuestion(randomGateQuestion());
          setGateAnswer("");
          setGateWrong(false);
          setExiting(true);
        }}
        className="text-xs font-semibold"
        style={{ color: PALETTE.inkFaint }}
      >
        I&apos;m a grown-up, take me back
      </button>
    </div>
    </div>
  );
}
