export function computeStreak(sessionDates: string[]): number {
  if (!sessionDates.length) return 0;
  const days = new Set(sessionDates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function last7DaysActivity(sessionDates: string[]) {
  const days = new Set(sessionDates.map((d) => new Date(d).toDateString()));
  const result: { label: string; active: boolean; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      active: days.has(d.toDateString()),
      isToday: i === 0,
    });
  }
  return result;
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function thisWeekActivity(sessionDates: string[]) {
  const days = new Set(sessionDates.map((d) => new Date(d).toDateString()));
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const result: { label: string; active: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push({
      label: WEEKDAY_LABELS[i],
      active: days.has(d.toDateString()),
      isToday: d.toDateString() === now.toDateString(),
    });
  }
  return result;
}
