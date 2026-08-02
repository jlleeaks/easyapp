"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Check, type LucideIcon } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: small ? 24 : 30,
          height: small ? 24 : 30,
          borderRadius: RADIUS.sm - 2,
          background: `linear-gradient(150deg, #4A6152, ${PALETTE.brand})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={small ? 12 : 15} height={small ? 12 : 15}>
          <path
            d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
            fill="#fff"
          />
        </svg>
      </div>
      <span
        className="font-serif-display"
        style={{
          fontSize: small ? 16 : 19,
          fontWeight: 700,
          color: PALETTE.ink,
          letterSpacing: "-0.01em",
        }}
      >
        Easy
      </span>
    </div>
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="text-[12px] font-semibold mb-2 flex items-center gap-1.5"
      style={{ color: color || PALETTE.inkSoft, letterSpacing: "0.04em" }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  icon,
  color,
  soft,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  color: string;
  soft: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-7 animate-fade-in-up">
      <IconTile size={48} color={color} soft={soft}>
        {icon}
      </IconTile>
      <div>
        <Eyebrow color={color}>{eyebrow}</Eyebrow>
        <div className="font-serif-display" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-sm mt-1.5" style={{ color: PALETTE.inkSoft }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function IconTile({
  children,
  color,
  soft,
  size = 36,
}: {
  children: React.ReactNode;
  color: string;
  soft: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: RADIUS.sm,
        background: soft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn-press w-full flex items-center justify-center gap-2 py-3 font-semibold text-[14px] transition-all duration-150 ease-out"
      style={{
        borderRadius: RADIUS.sm,
        background: disabled ? PALETTE.line : PALETTE.brand,
        color: disabled ? PALETTE.inkSoft : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = PALETTE.brandDeep;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = PALETTE.brand;
      }}
    >
      {children} {Icon && <Icon size={16} />}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="btn-press w-full flex items-center justify-center gap-2 py-2.5 font-medium border transition-all duration-150 ease-out"
      style={{ borderRadius: RADIUS.sm, borderColor: PALETTE.line, color: PALETTE.ink, background: PALETTE.card }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = PALETTE.brand;
        e.currentTarget.style.background = PALETTE.brandSoft;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = PALETTE.line;
        e.currentTarget.style.background = PALETTE.card;
      }}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  style,
  accent,
  tint,
  delay,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  tint?: string;
  delay?: number;
}) {
  return (
    <div
      className="mb-4 animate-fade-in-up"
      style={{
        background: tint ? `linear-gradient(160deg, #fff, ${tint} 220%)` : PALETTE.card,
        border: `1px solid ${accent || PALETTE.line}`,
        borderRadius: RADIUS.md,
        overflow: "hidden",
        minWidth: 0,
        animationDelay: delay ? `${delay}ms` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  color,
  soft,
  tilt,
}: {
  children: React.ReactNode;
  color: string;
  soft: string;
  tilt?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold"
      style={{
        background: soft,
        color,
        padding: "5px 11px",
        borderRadius: 100,
        transform: tilt ? "rotate(-2deg)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

export function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mr-1.5 mb-1.5 transition-transform duration-150 hover:scale-105"
      style={{ background: color || PALETTE.brandSoft, color: PALETTE.ink }}
    >
      {children}
    </span>
  );
}

const AVATAR_COLORS: [string, string][] = [
  ["#EB8153", PALETTE.accent],
  ["#4A6152", PALETTE.brand],
  ["#E0B24F", PALETTE.gold],
  ["#8C97C7", "#5C689E"],
];
function avatarColor(name: string | undefined) {
  if (!name) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function Avatar({ name, size }: { name?: string; size?: number }) {
  const s = size || 56;
  const [from, to] = avatarColor(name);
  return (
    <div
      className="font-serif-display"
      style={{
        width: s,
        height: s,
        borderRadius: "50%",
        background: `linear-gradient(150deg, ${from}, ${to})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: s * 0.4,
        flexShrink: 0,
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="text-sm font-medium mb-2" style={{ color: PALETTE.ink }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className="btn-press flex items-center gap-1.5 px-3 py-2 text-sm transition-all duration-150 ease-out"
              style={{
                borderRadius: RADIUS.sm,
                background: selected ? PALETTE.brand : PALETTE.card,
                color: selected ? "#fff" : PALETTE.ink,
                border: `1px solid ${selected ? PALETTE.brand : PALETTE.line}`,
                fontWeight: selected ? 600 : 400,
              }}
            >
              {selected && <Check size={13} strokeWidth={3} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-5">
      <div className="text-sm font-medium mb-2" style={{ color: PALETTE.ink }}>
        {label} {optional && <span style={{ color: PALETTE.inkSoft, fontWeight: 400 }}>(optional)</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm outline-none transition-all duration-150"
        style={{
          borderRadius: RADIUS.sm,
          border: `1.5px solid ${focused ? PALETTE.brand : PALETTE.line}`,
          background: PALETTE.card,
          boxShadow: focused ? `0 0 0 4px var(--ring-brand)` : "none",
        }}
      />
    </div>
  );
}

export function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
      <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: PALETTE.brandSoft, animation: "pulse-ring 1.6s ease-in-out infinite" }}
        />
        <Loader2 size={24} className="animate-spin relative" color={PALETTE.brand} />
      </div>
      <div className="text-sm" style={{ color: PALETTE.inkSoft }}>
        {text}
      </div>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card accent="#F0C8B8" tint={PALETTE.accentSoft}>
      <div className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle size={18} color={PALETTE.accent} />
          <div className="text-sm">{message}</div>
        </div>
        <SecondaryButton onClick={onRetry}>Try again</SecondaryButton>
      </div>
    </Card>
  );
}

export function Row({
  icon,
  iconColor,
  iconSoft,
  title,
  subtitle,
  trailing,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconSoft: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <IconTile color={iconColor} soft={iconSoft} size={34}>
        {icon}
      </IconTile>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ marginBottom: subtitle ? 2 : 0 }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs truncate" style={{ color: PALETTE.inkSoft }}>
            {subtitle}
          </p>
        )}
      </div>
      {trailing}
    </>
  );

  const interactive = Boolean(href || onClick);
  const className = "flex items-center gap-3 px-5 py-4 w-full text-left transition-colors duration-150";
  const style = { borderBottom: `1px solid ${PALETTE.line}` };
  const hoverHandlers = interactive
    ? {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.015)";
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          e.currentTarget.style.background = "transparent";
        },
      }
    : {};

  if (href) {
    return (
      <Link href={href} className={className} style={style} {...hoverHandlers}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style} {...hoverHandlers}>
        {content}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

export function RowList({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="[&>*:last-child]:border-b-0"
      style={{ borderTop: `1px solid ${PALETTE.line}` }}
    >
      {children}
    </div>
  );
}
