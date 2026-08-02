import { subjectMeta } from "@/lib/subjects";

/** The one consistent subject pill treatment — same colors/icon everywhere a subject is tagged. */
export function SubjectBadge({ subject, size = "sm" }: { subject: string; size?: "sm" | "md" }) {
  const meta = subjectMeta(subject);
  const padding = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${padding}`}
      style={{ background: meta.soft, color: meta.color }}
    >
      <meta.icon size={size === "md" ? 13 : 11} />
      {meta.label}
    </span>
  );
}
