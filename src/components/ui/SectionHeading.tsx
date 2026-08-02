import { PALETTE } from "@/lib/palette";

/** The one consistent section-heading treatment reused across Home, Progress, and Profile. */
export function SectionHeading({
  children,
  icon,
  color,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="font-serif-display font-bold" style={{ fontSize: 18, color: color ?? PALETTE.ink }}>
        {children}
      </h2>
    </div>
  );
}
