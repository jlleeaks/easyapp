"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";

export function ActionCard({
  href,
  icon,
  color,
  soft,
  title,
  subtitle,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  color: string;
  soft: string;
  title: string;
  subtitle: string;
  cta: string;
}) {
  return (
    <Link href={href} className="block group">
      <div
        className="btn-press relative overflow-hidden h-full flex flex-col rounded-2xl p-4 transition-all duration-150 ease-out group-hover:-translate-y-0.5"
        style={{ background: `linear-gradient(155deg, #fff, ${soft} 220%)`, border: `1px solid ${PALETTE.line}` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 8px 20px -12px ${color}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = PALETTE.line;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 110, height: 110, top: -38, right: -38, background: soft, opacity: 0.7 }}
        />
        <div
          className="relative flex items-center justify-center mb-3"
          style={{ width: 44, height: 44, borderRadius: RADIUS.sm, background: color, transform: "rotate(-6deg)" }}
        >
          {icon}
        </div>
        <div className="relative text-sm font-bold mb-0.5">{title}</div>
        <div className="relative text-xs mb-3 flex-1" style={{ color: PALETTE.inkSoft }}>
          {subtitle}
        </div>
        <div className="relative flex items-center gap-1 text-xs font-bold" style={{ color }}>
          {cta} <ArrowRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
