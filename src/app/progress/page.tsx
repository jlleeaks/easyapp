import { redirect } from "next/navigation";
import { TrendingUp, Check, Sparkles, ChevronRight, NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { PageHeader, Eyebrow, Card, Row, RowList, AiMarkdown } from "@/components/ui/primitives";
import { GrowthRing } from "@/components/ui/GrowthRing";
import { StageLegend } from "@/components/ui/StageLegend";
import { WeekTracker } from "@/components/ui/WeekTracker";
import { AskEasyCard } from "@/components/ui/AskEasyCard";
import { NextStepsCard } from "@/components/ui/NextStepsCard";
import { MilestonesCard } from "@/components/ui/MilestonesCard";
import { StreakNote } from "@/components/ui/StreakNote";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import type { ChildProfile, Session, Skill, Subject } from "@/lib/types";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle<ChildProfile>();
  if (!child) redirect("/onboarding");

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("child_id", child.id)
    .returns<Skill[]>();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .returns<Session[]>();

  const dates = (sessions ?? []).map((s) => s.created_at);

  const skillsBySubject: Record<Subject, Skill[]> = { math: [], writing: [], reading: [] };
  for (const s of skills ?? []) {
    const key = (SUBJECTS.some((sub) => sub.key === s.subject) ? s.subject : "math") as Subject;
    skillsBySubject[key].push(s);
  }

  const notedSessions = (sessions ?? []).filter((s) => s.parent_notes && s.parent_notes.trim().length > 0).slice(0, 5);

  return (
    <Shell wide>
      <PageHeader
        icon={<TrendingUp size={22} color={PALETTE.gold} />}
        color={PALETTE.gold}
        soft={PALETTE.goldSoft}
        eyebrow="Progress"
        title={`${child.name}'s progress`}
        subtitle={`No scores, no ranking — just a running record of what ${child.name} has practiced and how it went`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <StreakNote sessionDates={dates} />

          <MilestonesCard childName={child.name} skills={skills ?? []} />

          {(skillsBySubject.math.length > 0 || skillsBySubject.writing.length > 0 || skillsBySubject.reading.length > 0) && (
            <div>
              <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
                Skill progress
              </p>
              <div className="flex flex-col gap-3">
                <StageLegend />
                {SUBJECTS.map((s) => {
                  const subjectSkills = skillsBySubject[s.key];
                  if (subjectSkills.length === 0) return null;
                  return (
                    <Card key={s.key} style={{ marginBottom: 0 }}>
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <s.icon size={13} color={s.color} />
                          <Eyebrow color={s.color}>{s.label}</Eyebrow>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {subjectSkills.map((sk) => (
                            <GrowthRing key={sk.id} label={sk.skill_name} stage={sk.stage} />
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
              Insights &amp; next steps
            </p>
            <div className="flex flex-col gap-3">
              {notedSessions.length > 0 && (
                  <Card style={{ marginBottom: 0 }}>
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 mb-3">
                        <NotebookPen size={13} color={PALETTE.gold} />
                        <Eyebrow color={PALETTE.gold}>What you&apos;ve noticed</Eyebrow>
                      </div>
                      <div className="flex flex-col gap-3 [&>*:last-child]:border-b-0 [&>*:last-child]:pb-0">
                        {notedSessions.map((s) => {
                          const meta = subjectMeta(s.subject);
                          return (
                            <div key={s.id} className="pb-3" style={{ borderBottom: `1px solid ${PALETTE.line}` }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: meta.soft, color: meta.color }}
                                >
                                  {s.skill}
                                </span>
                                <span className="text-[11px]" style={{ color: PALETTE.inkFaint }}>
                                  <LocalDateLabel iso={s.created_at} />
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
                                {s.parent_notes}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                )}

              <NextStepsCard childId={child.id} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
              Full history
            </p>
            <Card style={{ marginBottom: 0 }}>
              <div className="p-5 pb-3">
                <Eyebrow>Every session, oldest to newest</Eyebrow>
              </div>
              {(!sessions || sessions.length === 0) ? (
                <div className="px-5 pb-5 text-sm" style={{ color: PALETTE.inkSoft }}>
                  No sessions yet.
                </div>
              ) : (
                <RowList>
                  {sessions.map((s) => {
                    const meta = subjectMeta(s.subject);
                    return (
                      <Row
                        key={s.id}
                        href={s.source === "library" ? (s.book_id ? `/library?book=${s.book_id}` : "/library") : `/homework?subject=${s.subject}&session=${s.id}`}
                        icon={<Check size={16} />}
                        iconColor={meta.color}
                        iconSoft={meta.soft}
                        title={s.skill}
                        subtitle={s.micro_message ?? undefined}
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
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <AskEasyCard prompt="“Is Maya on track for kindergarten?” — get a straight answer, anytime." />
          <WeekTracker sessionDates={dates} />
          <Card tint={PALETTE.accentSoft} style={{ marginBottom: 0 }}>
            <div className="p-[1.15rem]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} color={PALETTE.accent} />
                <Eyebrow color={PALETTE.accent}>What we&apos;ve learned so far</Eyebrow>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: PALETTE.inkSoft }}>
                {child.summary ? (
                  <AiMarkdown content={child.summary} />
                ) : (
                  "Complete a few sessions and this will start filling in."
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
