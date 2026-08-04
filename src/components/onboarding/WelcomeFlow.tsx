"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { PrimaryButton } from "@/components/ui/primitives";
import { DoodleHeart, DoodleSprout, DoodlePencil, DoodleSparkle } from "@/components/marketing/Doodles";

type Screen = {
  icon: (props: { color?: string; size?: number }) => React.ReactNode;
  color: string;
  soft: string;
  eyebrow: string;
  heading: string;
  body: React.ReactNode;
  buttonLabel: string;
};

function buildScreens(childName: string): Screen[] {
  return [
    {
      icon: (p) => <DoodleHeart {...p} />,
      color: PALETTE.accent,
      soft: PALETTE.accentSoft,
      eyebrow: "Welcome",
      heading: "You're all set up!",
      body: (
        <>
          Thank you for choosing us! We&apos;re looking forward to making teaching, mentoring, and guiding {childName}
          {" "}<em>easy</em>.
        </>
      ),
      buttonLabel: "Continue",
    },
    {
      icon: (p) => <DoodleSprout {...p} />,
      color: PALETTE.brand,
      soft: PALETTE.brandSoft,
      eyebrow: "What Easy helps with",
      heading: `Everything ${childName} needs, in one place`,
      body: (
        <div className="flex flex-col gap-2.5 text-left">
          <p>
            <strong>Tonight&apos;s activity</strong> — a short, tailored lesson picked for {childName}, every night.
          </p>
          <p>
            <strong>Homework help</strong> — snap a photo of any worksheet for an instant parent-coaching briefing.
          </p>
          <p>
            <strong>Reading together</strong> — bedtime story guides for books {childName} already owns.
          </p>
          <p>
            <strong>A learning roadmap</strong> — a clear picture of kindergarten and where {childName} stands.
          </p>
        </div>
      ),
      buttonLabel: "Continue",
    },
    {
      icon: (p) => <DoodlePencil {...p} />,
      color: PALETTE.gold,
      soft: PALETTE.goldSoft,
      eyebrow: "What to do",
      heading: "Your day-to-day",
      body: (
        <div className="flex flex-col gap-2.5 text-left">
          <p>Check Home each day for tonight&apos;s pick, or choose your own activity.</p>
          <p>After homework or reading, do a 30-second check-in — that&apos;s what makes Easy sharper over time.</p>
          <p>Stuck or unsure? Ask Easy anything, anytime.</p>
        </div>
      ),
      buttonLabel: "Continue",
    },
    {
      icon: (p) => <DoodleSparkle {...p} />,
      color: PALETTE.violetDeep,
      soft: PALETTE.violetSoft,
      eyebrow: "Getting the most out of Easy",
      heading: `Building toward ${childName}'s goals`,
      body: (
        <>
          The more real moments you share — a report card, something a teacher said, a rough night — the more
          precisely Easy can guide you. Little and often beats long, perfect sessions. We&apos;re glad to be part of
          this with you.
        </>
      ),
      buttonLabel: "Let's begin!",
    },
  ];
}

export function WelcomeFlow({ childName, onDone }: { childName: string; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const screens = buildScreens(childName);
  const screen = screens[index];
  const isLast = index === screens.length - 1;

  function advance() {
    if (isLast) {
      onDone();
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg }} className="w-full flex justify-center items-center px-6 py-10">
      <div className="w-full animate-fade-in" style={{ maxWidth: 480 }}>
        <div className="flex gap-1.5 mb-8">
          {screens.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: PALETTE.line }}>
              <div
                className="h-full rounded-full transition-transform duration-500 ease-out"
                style={{
                  background: PALETTE.brand,
                  transform: i <= index ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </div>
          ))}
        </div>

        <button onClick={advance} className="w-full text-left cursor-pointer" aria-label="Tap to continue">
          <div
            key={index}
            className="rounded-3xl p-8 flex flex-col items-center text-center animate-fade-in-up"
            style={{ background: screen.soft, border: `1px solid ${PALETTE.line}` }}
          >
            <div
              className="flex items-center justify-center mb-5"
              style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff" }}
            >
              {screen.icon({ color: screen.color, size: 34 })}
            </div>
            <p className="text-xs font-bold uppercase mb-2" style={{ color: screen.color, letterSpacing: "0.06em" }}>
              {screen.eyebrow}
            </p>
            <h2 className="font-serif-display font-bold mb-3" style={{ fontSize: 24, color: PALETTE.ink }}>
              {screen.heading}
            </h2>
            <div className="text-sm leading-relaxed" style={{ color: PALETTE.inkSoft }}>
              {screen.body}
            </div>
          </div>
        </button>

        <div className="mt-5">
          <PrimaryButton onClick={advance} icon={ArrowRight}>
            {screen.buttonLabel}
          </PrimaryButton>
          {!isLast && (
            <p className="text-xs text-center mt-3" style={{ color: PALETTE.inkFaint }}>
              Tap to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
