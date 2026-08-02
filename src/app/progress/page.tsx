import { redirect } from "next/navigation";
import { TrendingUp, Check, Sparkles, ChevronRight, NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { PageHeader, Eyebrow, Card, Row, RowList } from "@/components/ui/primitives";
import { GrowthRing } from "@/components/ui/GrowthRing";
import { WeekTracker } from "@/components/ui/WeekTracker";
import { AskEasyCard } from "@/components/ui/AskEasyCard";
import { NextStepsCard } from "@/components/ui/NextStepsCard";
import { MilestonesCard } from "@/components/ui/MilestonesCard";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import { computeStreak, thisWeekActivity } from "@/lib/streak";
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
  const streak = computeStreak(dates);
  const week = thisWeekActivity(dates);

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
        subtitle={`No scores, no ranking — just real, verified proof of how far ${child.name} has come`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          {streak > 0 && (
            <p className="text-xs -mb-1 px-1" style={{ color: PALETTE.inkSoft }}>
              {streak} day{streak === 1 ? "" : "s"} in a row — that consistency is what moves the needle.
            </p>
          )}

          <MilestonesCard childName={child.name} skills={skills ?? []} />

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
                            {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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

          {SUBJECTS.map((s) => {
            const subjectSkills = skillsBySubject[s.key];
            if (subjectSkills.length === 0) return null;
            return (
              <Card key={s.key} style={{ marginBottom: 0 }}>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon size={13} color={s.color} />
                    <Eyebrow color={s.color}>{s.label} skills map</Eyebrow>
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

          <Card style={{ marginBottom: 0 }}>
            <div className="p-5 pb-3">
              <Eyebrow>Session history</Eyebrow>
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
                      href={s.source === "library" ? "/library" : `/homework?subject=${s.subject}&session=${s.id}`}
                      icon={<Check size={16} />}
                      iconColor={meta.color}
                      iconSoft={meta.soft}
                      title={s.skill}
                      subtitle={s.micro_message ?? undefined}
                      trailing={
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs font-semibold" style={{ color: PALETTE.inkSoft }}>
                            {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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
          <AskEasyCard prompt="“Is Maya on track for kindergarten?” — get a straight answer, anytime." />
          <WeekTracker days={week} />
          <Card tint={PALETTE.accentSoft} style={{ marginBottom: 0 }}>
            <div className="p-[1.15rem]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} color={PALETTE.accent} />
                <Eyebrow color={PALETTE.accent}>What we&apos;ve learned so far</Eyebrow>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: PALETTE.inkSoft }}>
                {child.summary || "Complete a few sessions and this will start filling in."}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
