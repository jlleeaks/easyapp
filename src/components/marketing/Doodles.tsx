export function TornEdge({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 44"
      preserveAspectRatio="none"
      style={{
        display: "block",
        width: "100%",
        height: 32,
        transform: flip ? "scaleY(-1)" : undefined,
      }}
    >
      <path
        d="M0,18 L40,9 L82,22 L121,6 L163,20 L206,11 L248,26 L289,8 L333,17 L372,4 L415,23 L456,12 L498,28 L540,7 L582,19 L624,10 L667,25 L708,6 L751,21 L793,13 L835,27 L877,9 L919,18 L961,5 L1003,22 L1045,11 L1087,26 L1129,8 L1171,19 L1200,14 L1200,44 L0,44 Z"
        fill={fill}
      />
    </svg>
  );
}

export function DoodleSprout({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 42V22" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M24 22C24 22 12 22 10 12C10 12 24 10 24 22Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 17C24 17 34 15 37 7C37 7 24 4 24 17Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 42H31" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleOpenBook({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 13C21 10 14 9 8 10.5V35C14 33.5 21 34.5 24 37.5C27 34.5 34 33.5 40 35V10.5C34 9 27 10 24 13Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M24 13V37.5" stroke={color} strokeWidth="2.2" />
      <path d="M13 16.5C16 15.7 19 16 21 17.3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 22C16 21.2 19 21.5 21 22.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M27 17.3C29 16 32 15.7 35 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M27 22.8C29 21.5 32 21.2 35 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleHeart({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 39C24 39 8 29 8 18.5C8 12.5 12.5 9 17 9C20 9 23 11 24 14C25 11 28 9 31 9C35.5 9 40 12.5 40 18.5C40 29 24 39 24 39Z"
        stroke={color}
        strokeWidth="2.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodlePencil({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M12 36L9 41L14 38L34 18C36 16 36 13.5 34 11.5C32 9.5 29.5 9.5 27.5 11.5L8 31L12 36Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M25 14L31 20" stroke={color} strokeWidth="2" />
      <path d="M9 41L12.5 39.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M39 39C41 39 43 37 43 35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleSparkle({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M22 6C22 14 20 20 8 22C20 24 22 30 22 38C22 30 24 24 36 22C24 20 22 14 22 6Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M38 26C38 30 37 32 32 33C37 34 38 36 38 40C38 36 39 34 44 33C39 32 38 30 38 26Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleShield({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 6C24 6 14 9 9 10.5V23C9 33 16 39.5 24 42C32 39.5 39 33 39 23V10.5C34 9 24 6 24 6Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M17 23L22 28L32 17" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DoodleChat({ color = "currentColor", size = 40, className }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M8 13C8 10 10.5 8 13.5 8H34.5C37.5 8 40 10 40 13V26C40 29 37.5 31 34.5 31H21L12 39V31H13.5C10.5 31 8 29 8 26V13Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M16 16.5H32" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 22.5H26" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
