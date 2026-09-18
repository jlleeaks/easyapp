/** Original Easy illustration; decorative, with no child interaction. */
export function TrailGuide({
  className = "",
  variant = "green",
}: {
  className?: string;
  variant?: "green" | "blue";
}) {
  const fill = variant === "green" ? "#3CAA6B" : "#2F7DE0";
  return (
    <svg
      className={className}
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="91" cy="158" rx="49" ry="9" fill="#2B3648" opacity=".08" />
      <path
        d="M65 142l-9 14m58-14 10 14"
        stroke="#2B3648"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M40 98 25 85m113 11 16-18"
        stroke={fill}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M39 94c0-32 18-53 49-53 30 0 51 23 51 55v23c0 23-17 35-49 35-31 0-51-14-51-36V94Z"
        fill={fill}
      />
      <path
        d="M84 43C62 40 58 21 64 15c17-1 31 12 25 28m0 0c0-19 13-27 28-23-1 15-10 23-28 23Z"
        fill="#257C4B"
      />
      <ellipse cx="88" cy="104" rx="35" ry="31" fill="#F2FAE8" />
      <path
        d="M75 96v5m27-5v5"
        stroke="#2B3648"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M81 114q8 8 16-1"
        stroke="#2B3648"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="67" cy="109" r="5" fill="#FFC63D" />
      <circle cx="111" cy="109" r="5" fill="#FFC63D" />
      <path d="m144 32 3 8 9 2-8 5-1 9-6-7-9 1 5-8-3-8 10 2Z" fill="#FFC63D" />
    </svg>
  );
}
