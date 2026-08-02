import { redirect } from "next/navigation";
import { Camera, TrendingUp, ChevronRight, Check, Sparkles, BookOpen, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Card, Row, RowList, Wordmark } from "@/components/ui/primitives";
import { ActionCard } from "@/components/ui/ActionCard";
import { AskEasyCard } from "@/components/ui/AskEasyCard";
import { AchievementBadge } from "@/components/ui/AchievementBadge";
import { WeekTracker } from "@/components/ui/WeekTracker";
import { TonightSuggestionCard } from "@/components/ui/TonightSuggestionCard";
import { Hero } from "@/components/ui/Hero";
import { computeStreak, thisWeekActivity } from "@/lib/streak";
import type { ChildProfile, Session, Skill } from "@/lib/types";

export default async function DashboardPage() {
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

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Session[]>();

  const { data: parent } = await supabase
    .from("parents")
    .select("name")
    .eq("id", user.id)
    .maybeSingle<{ name: string | null }>();

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("child_id", child.id)
    .order("updated_at", { ascending: false })
    .limit(6)
    .returns<Skill[]>();
  const featuredSkill = skills?.[0] ?? null;

  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("child_id", child.id);

  const sessionDates = (sessions ?? []).map((s) => s.created_at);
  const streak = computeStreak(sessionDates);
  const week = thisWeekActivity(sessionDates);
  const doneToday = week.find((d) => d.isToday)?.active ?? false;

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <Wordmark small />
      </div>
      <Hero childName={child.name} parentName={parent?.name} streak={streak} sessionCount={sessionCount ?? 0} />

      {!doneToday && (
        <div
          className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl animate-fade-in-up"
          style={{ background: PALETTE.goldSoft, border: `1px solid ${PALETTE.goldLine}` }}
        >
          <Moon size={16} color={PALETTE.gold} className="flex-shrink-0" />
          <p className="text-sm font-semibold" style={{ color: "#8a5c10" }}>
            {child.name}
            {" "}
            hasn&apos;t done tonight&apos;s session yet
            {streak > 0 ? ` — pick one below to keep the ${streak}-day streak going.` : " — pick one below to get started."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionCard
              key="homework"
              href="/homework"
              icon={<Camera size={19} color="#fff" />}
              color={PALETTE.accent}
              soft={PALETTE.accentSoft}
              title="Have homework?"
              subtitle="Take a picture, get tonight’s plan"
              cta="Photograph it"
            />
            <ActionCard
              key="practice"
              href="/practice"
              icon={<Sparkles size={19} color="#fff" />}
              color={PALETTE.gold}
              soft={PALETTE.goldSoft}
              title="No homework tonight?"
              subtitle={`Get a lesson built around ${child.name}'s strengths`}
              cta="Build a lesson"
            />
            <ActionCard
              key="library"
              href="/library"
              icon={<BookOpen size={19} color="#fff" />}
              color={PALETTE.brand}
              soft={PALETTE.brandSoft}
              title="Want a bedtime story?"
              subtitle="Turn tonight’s book into a real chat"
              cta="Pick a book"
            />
          </div>

          <TonightSuggestionCard childId={child.id} />

          {sessions && sessions.length > 0 && (
            <Card style={{ marginBottom: 0 }}>
              <div className="flex items-center gap-3 p-5 pb-3">
                <div
                  style={{ width: 36, height: 36, borderRadius: 11, background: PALETTE.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <TrendingUp size={16} color={PALETTE.brand} />
                </div>
                <p className="text-[15px] font-semibold">Recent sessions</p>
              </div>
              <RowList>
                {sessions.map((s) => (
                  <Row
                    key={s.id}
                    href={s.source === "library" ? "/library" : `/homework?subject=${s.subject}&session=${s.id}`}
                    icon={s.source === "library" ? <BookOpen size={16} /> : <Check size={16} />}
                    iconColor={PALETTE.brand}
                    iconSoft={PALETTE.brandSoft}
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
                ))}
              </RowList>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <AskEasyCard />

          <WeekTracker days={week} />

          {featuredSkill && (
            <AchievementBadge
              skillName={featuredSkill.skill_name}
              stage={featuredSkill.stage}
              note={
                sessions?.[0]?.micro_message
                  ? sessions[0].micro_message.length > 60
                    ? sessions[0].micro_message.slice(0, 57) + "…"
                    : sessions[0].micro_message
                  : "Real, verified progress — keep showing up and it'll keep growing."
              }
            />
          )}
        </div>
      </div>
    </Shell>
  );
}
