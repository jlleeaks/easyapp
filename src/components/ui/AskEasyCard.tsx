import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";

const DOTS = [
  [20, 20], [66, 42], [108, 16], [148, 52], [204, 26], [252, 62],
  [40, 92], [96, 66], [126, 112], [224, 122], [270, 96], [12, 128],
];

export function AskEasyCard({ prompt }: { prompt?: string }) {
  return (
    <Link href="/chat" className="block group">
      <div
        className="btn-press relative overflow-hidden rounded-2xl p-5 transition-transform duration-150 ease-out group-hover:-translate-y-0.5"
        style={{ background: `linear-gradient(160deg, ${PALETTE.brand} 0%, ${PALETTE.brandDeep} 100%)` }}
      >
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }} viewBox="0 0 300 150" preserveAspectRatio="none">
          {DOTS.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={2} fill="#fff" />
          ))}
        </svg>
        <div
          className="relative flex items-center justify-center mb-3"
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.sm,
            background: "rgba(255,255,255,0.14)",
            transform: "rotate(-5deg)",
          }}
        >
          <Sparkles size={19} color="#fff" />
        </div>
        <div className="relative text-white font-bold text-[15px] mb-1.5">Ask Easy anything</div>
        <div className="relative text-xs mb-3.5" style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.5 }}>
          {prompt ?? "“Why does she rush her math?” — get a straight answer, anytime."}
        </div>
        <div
          className="relative inline-flex items-center gap-1.5 text-xs font-bold transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ background: "#fff", color: PALETTE.brandDeep, padding: "8px 13px", borderRadius: RADIUS.sm }}
        >
          Start a chat <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}
