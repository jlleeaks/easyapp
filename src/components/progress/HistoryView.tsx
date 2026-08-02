"use client";

import Link from "next/link";
import { ChevronRight, BookOpen, Check, NotebookPen } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Card, Eyebrow, RowList, Row } from "@/components/ui/primitives";
import { WeekTracker } from "@/components/ui/WeekTracker";
import { StreakNote } from "@/components/ui/StreakNote";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { subjectMeta } from "@/lib/subjects";
import { areaForFocusText } from "@/lib/roadmap";
import type { Session, CheckinAnswers, LibraryCheckinAnswers } from "@/lib/types";

function isHomeworkCheckin(c: Session["checkin"]): c is CheckinAnswers {
  return Boolean(c && "overall" in c);
}
function isLibraryCheckin(c: Session["checkin"]): c is LibraryCheckinAnswers {
  return Boolean(c && "response" in c);
}

function sessionHref(s: Session): string {
  if (s.source === "library") return s.book_id ? `/library?book=${s.book_id}` : "/library";
  return `/homework?subject=${s.subject}&session=${s.id}`;
}

export function HistoryView({ childName, sessions, dates }: { childName: string; sessions: Session[]; dates: string[] }) {
  const notedSessions = sessions.filter((s) => s.parent_notes?.trim()).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        {notedSessions.length > 0 && (
          <Card style={{ marginBottom: 0 }}>
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <NotebookPen size={13} color={PALETTE.gold} />
                <Eyebrow color={PALETTE.gold}>What you&apos;ve noticed</Eyebrow>
              </div>
              <div className="flex flex-col gap-3">
                {notedSessions.map((s) => (
                  <div key={s.id} className="pb-3 last:pb-0 last:border-0" style={{ borderBottom: `1px solid ${PALETTE.line}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: subjectMeta(s.subject).soft, color: subjectMeta(s.subject).color }}>
                        {s.skill}
                      </span>
                      <span className="text-[11px]" style={{ color: PALETTE.inkFaint }}>
                        <LocalDateLabel iso={s.created_at} />
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: PALETTE.inkSoft }}>{s.parent_notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 0 }}>
          <div className="p-5 pb-3">
            <Eyebrow>Every activity, newest to oldest</Eyebrow>
          </div>
          {sessions.length === 0 ? (
            <div className="px-5 pb-5 text-sm" style={{ color: PALETTE.inkSoft }}>
              No activities yet.
            </div>
          ) : (
            <RowList>
              {sessions.map((s) => {
                const meta = subjectMeta(s.subject);
                const area = areaForFocusText(s.subject, s.skill);
                const cinHomework = isHomeworkCheckin(s.checkin) ? s.checkin : null;
                const cinLibrary = isLibraryCheckin(s.checkin) ? s.checkin : null;
                const subtitleParts = [
                  area ? `${meta.label} · ${area.area}` : meta.label,
                  cinHomework ? `You reported: ${cinHomework.overall}` : null,
                  cinLibrary ? `You reported: ${cinLibrary.response}` : null,
                  s.micro_message ? `Easy: ${s.micro_message.length > 70 ? s.micro_message.slice(0, 67) + "…" : s.micro_message}` : null,
                ].filter(Boolean);
                return (
                  <Row
                    key={s.id}
                    href={sessionHref(s)}
                    icon={s.source === "library" ? <BookOpen size={16} /> : <Check size={16} />}
                    iconColor={meta.color}
                    iconSoft={meta.soft}
                    title={s.skill}
                    subtitle={subtitleParts.join(" — ")}
                    trailing={
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-semibold" style={{ color: PALETTE.inkSoft }}>
                          <LocalDateLabel iso={s.created_at} />
                        </span>
                        <ChevronRight size={16} color={PALETTE.inkFaint} />
                      </div>
                    }
                  />
                );
              })}
            </RowList>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <StreakNote sessionDates={dates} />
        <WeekTracker sessionDates={dates} />
        <p className="text-xs px-1" style={{ color: PALETTE.inkFaint }}>
          Session-history dates shown in your local time.{" "}
          <Link href="/profile" className="font-semibold underline" style={{ color: PALETTE.inkSoft }}>
            See {childName}&apos;s full profile
          </Link>
        </p>
      </div>
    </div>
  );
}
