import { PALETTE } from "@/lib/palette";

/**
 * Composed, tasteful subject illustrations for the Home hero — built from the
 * app's existing line-art doodle language (single stroke color, soft tint
 * fills), never emoji or stock art. Purpose: tell the parent at a glance
 * what kind of activity this is.
 */

export function MathScene({ size = 180 }: { size?: number }) {
  const stroke = PALETTE.accent;
  const fill = PALETTE.accentSoft;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <rect x="34" y="70" width="44" height="44" rx="10" fill={fill} stroke={stroke} strokeWidth="2.4" />
      <text x="56" y="99" textAnchor="middle" fontSize="22" fontWeight="700" fill={stroke} fontFamily="sans-serif">2</text>

      <rect x="90" y="52" width="44" height="44" rx="10" fill={fill} stroke={stroke} strokeWidth="2.4" transform="rotate(-6 112 74)" />
      <text x="112" y="80" textAnchor="middle" fontSize="22" fontWeight="700" fill={stroke} fontFamily="sans-serif" transform="rotate(-6 112 74)">3</text>

      <circle cx="146" cy="112" r="24" fill={fill} stroke={stroke} strokeWidth="2.4" />
      <text x="146" y="120" textAnchor="middle" fontSize="20" fontWeight="700" fill={stroke} fontFamily="sans-serif">5</text>

      <path d="M50 122 Q80 145 130 128" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" fill="none" />
      <path d="M104 130 L120 130 L112 140 Z" fill={stroke} opacity="0.85" />

      <path
        d="M42 150c4-4 9 4 13 0"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="150" cy="50" r="7" stroke={stroke} strokeWidth="2" fill="none" />
      <rect x="24" y="34" width="14" height="14" rx="3" stroke={stroke} strokeWidth="2" fill="none" transform="rotate(12 31 41)" />
    </svg>
  );
}

export function WritingScene({ size = 180 }: { size?: number }) {
  const stroke = PALETTE.gold;
  const fill = PALETTE.goldSoft;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <rect x="36" y="46" width="90" height="112" rx="8" fill={fill} stroke={stroke} strokeWidth="2.4" transform="rotate(-4 81 102)" />

      <g transform="rotate(-4 81 102)">
        <path d="M50 78c10-3 20-3 30 1" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.35" fill="none" />
        <path d="M50 92c16-3 32-3 46 2" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M50 106c14-3 26-3 36 1" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M50 120c10-2 18-2 24 1" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      <g transform="translate(120 30) rotate(40)">
        <rect x="-4" y="-26" width="8" height="30" rx="3" fill={stroke} />
        <path d="M-4 4 L4 4 L0 14 Z" fill={PALETTE.goldLine} />
      </g>

      <path d="M56 150c8 6 20 6 28 0" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <circle cx="150" cy="140" r="6" stroke={stroke} strokeWidth="2" fill="none" />
      <circle cx="160" cy="120" r="3.5" fill={stroke} opacity="0.6" />
    </svg>
  );
}

export function ReadingScene({ size = 180 }: { size?: number }) {
  const stroke = PALETTE.violet;
  const fill = PALETTE.violetSoft;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path
        d="M40 70c22-8 40-6 56 6c16-12 34-14 56-6v66c-22-8-40-6-56 6c-16-12-34-14-56-6Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M96 76v66" stroke={stroke} strokeWidth="2.2" />
      <path d="M54 84c8-2 18-1 26 3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" fill="none" />
      <path d="M54 96c8-2 18-1 26 3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" fill="none" />
      <path d="M120 87c8-4 18-5 26-3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" fill="none" />
      <path d="M120 99c8-4 18-5 26-3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" fill="none" />

      <path
        d="M138 34c14 0 24 8 24 18c0 9-8 16-19 18l3 10-13-9c-10-1-19-8-19-18c0-10 10-19 24-19Z"
        fill="#fff"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="130" cy="52" r="2.6" fill={stroke} />
      <circle cx="140" cy="52" r="2.6" fill={stroke} />
      <circle cx="150" cy="52" r="2.6" fill={stroke} />
    </svg>
  );
}

export function subjectScene(subject: string, size?: number) {
  if (subject === "math") return <MathScene size={size} />;
  if (subject === "writing") return <WritingScene size={size} />;
  return <ReadingScene size={size} />;
}
