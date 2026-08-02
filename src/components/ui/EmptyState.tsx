import { PALETTE } from "@/lib/palette";

/** A document gaining a pencil mark + a small forming dot-path — "a picture is starting to form," not a sad/broken state. */
export function BuildingPictureArt({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="12" y="6" width="26" height="34" rx="3" stroke={PALETTE.brandLine} strokeWidth="2" fill={PALETTE.card} />
      <line x1="17" y1="15" x2="33" y2="15" stroke={PALETTE.line} strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="21" x2="33" y2="21" stroke={PALETTE.line} strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="27" x2="27" y2="27" stroke={PALETTE.line} strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(30 28) rotate(45)">
        <rect x="-2.5" y="-14" width="5" height="16" rx="2" fill={PALETTE.gold} />
        <path d="M-2.5 2 L2.5 2 L0 8 Z" fill={PALETTE.goldLine} />
      </g>
      <circle cx="42" cy="44" r="2.5" fill={PALETTE.brandLine} />
      <circle cx="34" cy="47" r="2" fill={PALETTE.line} />
      <circle cx="47" cy="36" r="1.75" fill={PALETTE.line} />
    </svg>
  );
}

/** A purposeful empty state — explains what's missing and offers a direct action, never sad/broken imagery. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-6">
      {icon && <div className="mb-3">{icon}</div>}
      <p className="font-serif-display font-bold mb-1" style={{ fontSize: 16, color: PALETTE.ink }}>
        {title}
      </p>
      <p className="text-sm max-w-[38ch]" style={{ color: PALETTE.inkSoft }}>
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
