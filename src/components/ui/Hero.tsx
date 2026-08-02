import { Flame } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Avatar, Pill } from "@/components/ui/primitives";

export function Hero({
  childName,
  parentName,
  streak,
  sessionCount = 0,
}: {
  childName: string;
  parentName?: string | null;
  streak: number;
  sessionCount?: number;
}) {
  return (
    <div
      className="relative overflow-hidden mb-5 animate-fade-in-up"
      style={{
        borderRadius: RADIUS.lg + 4,
        border: `1px solid ${PALETTE.brandLine}`,
        background: `linear-gradient(120deg, ${PALETTE.brandSoft} 0%, ${PALETTE.goldSoft} 55%, ${PALETTE.bg} 100%)`,
        padding: "26px 30px",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.28 }}
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
      >
        <path
          d="M-20 150c40-30 80 20 120 0s80-40 120-10 80 30 120 5 80-35 120-5 80 25 120 0"
          fill="none"
          stroke={PALETTE.brand}
          strokeWidth="2"
        />
        <path
          d="M-20 60c40 25 80-15 120 0s80 30 120 5 80-25 120 0 80 20 120-5 80-15 120 5"
          fill="none"
          stroke={PALETTE.accent}
          strokeWidth="2"
        />
      </svg>
      <div className="relative flex items-center gap-5 flex-wrap min-w-0">
        <Avatar name={childName} size={72} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-1" style={{ color: PALETTE.inkSoft }}>
            Welcome{parentName ? `, ${parentName}` : ""} — to
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1
              className="font-serif-display relative inline-block"
              style={{ fontSize: 34, fontWeight: 800, color: PALETTE.accent, letterSpacing: "-0.015em" }}
            >
              {childName}
              <svg
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
                style={{ position: "absolute", left: 2, right: 6, bottom: -4, width: "calc(100% - 8px)", height: 9 }}
              >
                <path
                  d="M1 6c8-6 14 4 22 0s14-8 22-2 14 6 22 1 14-6 22 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <span className="font-serif-display font-semibold" style={{ fontSize: 18 }}>
              &rsquo;s learning space
            </span>
          </div>
          {streak > 0 && (
            <div className="mt-2.5">
              <Pill color={PALETTE.gold} soft={PALETTE.goldSoft} tilt>
                <Flame size={12} fill={PALETTE.gold} />
                {streak}-day streak
              </Pill>
            </div>
          )}
          {sessionCount > 0 && (
            <p className="text-xs mt-2" style={{ color: PALETTE.inkSoft }}>
              {sessionCount} session{sessionCount === 1 ? "" : "s"} together so far — that consistency is
              exactly what moves the needle.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
