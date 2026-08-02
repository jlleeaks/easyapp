"use client";

export function LocalDateLabel({
  iso,
  options,
}: {
  iso: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return <>{new Date(iso).toLocaleDateString(undefined, options ?? { month: "short", day: "numeric" })}</>;
}
