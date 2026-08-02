import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, Heart, ThumbsUp, Target, Brain, BookOpen, Layers, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Avatar, Chip, Card, Eyebrow } from "@/components/ui/primitives";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { ProfileInsightSection } from "@/components/profile/ProfileInsightSection";
import { ProfileIntakeTabs } from "@/components/profile/ProfileIntakeTabs";
import { STANDARDS_FRAMEWORK } from "@/lib/standards";
import type { ChildProfile } from "@/lib/types";

function currentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 6 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

export default async function ProfilePage() {
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

  const { count: libraryCheckinCount } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("child_id", child.id)
    .eq("source", "library")
    .not("checkin", "is", null);

  const strengths = child.strengths ?? [];
  const growthAreas = child.growth_areas ?? [];
  const patterns = child.learning_patterns ?? [];

  const reportOrAssignmentCount = [...strengths, ...growthAreas].filter(
    (i) => i.source === "report_card" || i.source === "assignment",
  ).length;
  const teacherCount = [...strengths, ...growthAreas, ...patterns].filter((i) => i.source === "teacher").length;
  const parentObservationCount = patterns.filter((p) => p.source === "parent").length;

  const howTheyLearnFacts = [child.frustration, child.learning_style, child.motivation, child.shy].filter(Boolean);
  const engagementPatterns = patterns.filter((p) => p.parent_response || p.helped !== null);

  const interestChips = (child.interests || "").split(",").filter((s) => s.trim());
  const hobbyChips = (child.hobbies || "").split(",").filter((s) => s.trim());
  const characterChips = (child.favorite_characters || "").split(",").filter((s) => s.trim());
  const hasInterests = interestChips.length > 0 || hobbyChips.length > 0 || characterChips.length > 0;

  const routineFacts: { label: string; value: string | null }[] = [
    { label: "Reads together", value: child.read_together },
    { label: "After a story", value: child.talks_after_story },
    { label: "Favorite books", value: child.favorite_books },
    { label: "Homework time", value: child.homework_time },
    { label: "Who's usually there", value: child.who_present },
  ].filter((f) => f.value);

  return (
    <Shell wide>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 mb-6 animate-fade-in-up"
        style={{ borderBottom: `1px solid ${PALETTE.line}` }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar name={child.name} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="font-serif-display" style={{ fontSize: 28, fontWeight: 700, color: PALETTE.accent, letterSpacing: "-0.01em" }}>
                {child.name}
              </h1>
              <Chip color={PALETTE.brandSoft}>Kindergarten</Chip>
            </div>
            <p className="text-xs mt-1" style={{ color: PALETTE.inkFaint }}>
              Profile last updated <LocalDateLabel iso={child.updated_at} options={{ month: "long", day: "numeric", year: "numeric" }} />
            </p>
          </div>
        </div>
        <Link href="/onboarding" className="flex-shrink-0">
          <div
            className="btn-press flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-semibold border transition-all duration-150"
            style={{ borderRadius: RADIUS.sm, borderColor: PALETTE.line, color: PALETTE.ink, background: PALETTE.card }}
          >
            <Pencil size={14} /> Edit {child.name}&apos;s profile
          </div>
        </Link>
      </div>

      <Card tint={PALETTE.brandSoft} style={{ marginBottom: 20 }}>
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers size={13} color={PALETTE.brand} />
            <Eyebrow color={PALETTE.brand}>What Easy is using</Eyebrow>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip>Parent setup</Chip>
            {reportOrAssignmentCount > 0 && (
              <Chip>
                {reportOrAssignmentCount} report-card/assignment note{reportOrAssignmentCount === 1 ? "" : "s"}
              </Chip>
            )}
            {teacherCount > 0 && (
              <Chip>
                {teacherCount} teacher note{teacherCount === 1 ? "" : "s"}
              </Chip>
            )}
            {(libraryCheckinCount ?? 0) > 0 && (
              <Chip>
                {libraryCheckinCount} story-session check-in{libraryCheckinCount === 1 ? "" : "s"}
              </Chip>
            )}
            {parentObservationCount > 0 && (
              <Chip>
                {parentObservationCount} parent observation{parentObservationCount === 1 ? "" : "s"}
              </Chip>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Compass size={13} color={PALETTE.gold} />
            <Eyebrow color={PALETTE.gold}>Learning standards</Eyebrow>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-sm font-bold">Kindergarten</p>
            <p className="text-sm" style={{ color: PALETTE.inkSoft }}>{STANDARDS_FRAMEWORK.name}</p>
            <p className="text-xs" style={{ color: PALETTE.inkFaint }}>{currentSchoolYear()} school year</p>
          </div>
          <p className="text-xs mt-1.5" style={{ color: PALETTE.inkFaint }}>
            State- and district-specific standards aren&apos;t configured yet — Easy uses this general Common Core
            reference for every family right now.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <div>
            <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
              Current academic picture — recent, editable
            </p>
            <div className="flex flex-col gap-3">
              <ProfileInsightSection
                childId={child.id}
                field="strengths"
                title="Strengths & current skills"
                icon={<ThumbsUp size={13} color={PALETTE.brand} />}
                color={PALETTE.brand}
                items={strengths}
                emptyText="Nothing yet — add a report card, teacher note, or home observation to start building this."
              />
              <ProfileInsightSection
                childId={child.id}
                field="growth_areas"
                title="Developing now"
                icon={<Target size={13} color={PALETTE.gold} />}
                color={PALETTE.gold}
                items={growthAreas}
              emptyText="Nothing yet — Easy will fill this in as sessions and check-ins come in."
              />
              <ProfileInsightSection
                childId={child.id}
                field="learning_patterns"
                title={`How ${child.name} learns`}
                icon={<Brain size={13} color={PALETTE.accent} />}
                color={PALETTE.accent}
                items={engagementPatterns}
                emptyText="Nothing yet — this fills in as check-ins reveal what helps and what doesn't."
              />
            </div>
          </div>

          {(howTheyLearnFacts.length > 0 || hasInterests || routineFacts.length > 0) && (
            <div>
              <p className="text-xs font-bold uppercase mb-2.5 px-1" style={{ color: PALETTE.inkFaint, letterSpacing: "0.06em" }}>
                Stable facts — from onboarding
              </p>
              <Card style={{ marginBottom: 0 }}>
                <div className="p-5">
                  {howTheyLearnFacts.length > 0 && (
                    <div className="mb-4">
                      <Eyebrow color={PALETTE.brand}>Temperament</Eyebrow>
                      <div className="flex flex-wrap gap-1.5">
                        {howTheyLearnFacts.map((f, i) => (
                          <Chip key={i}>{f}</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasInterests && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Heart size={12} color={PALETTE.accent} />
                        <Eyebrow color={PALETTE.accent}>Interests</Eyebrow>
                      </div>
                      <div>
                        {interestChips.map((t, i) => (
                          <Chip key={"i" + i}>{t.trim()}</Chip>
                        ))}
                        {hobbyChips.map((t, i) => (
                          <Chip key={"h" + i} color={PALETTE.brandSoft}>
                            {t.trim()}
                          </Chip>
                        ))}
                        {characterChips.map((t, i) => (
                          <Chip key={"c" + i} color={PALETTE.goldSoft}>
                            {t.trim()}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  {routineFacts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen size={12} color={PALETTE.brand} />
                        <Eyebrow color={PALETTE.brand}>Learning routine</Eyebrow>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {routineFacts.map((f) => (
                          <div key={f.label} className="rounded-xl p-2.5" style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}>
                            <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: PALETTE.inkFaint }}>
                              {f.label}
                            </p>
                            <p className="text-xs font-semibold leading-snug">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <ProfileIntakeTabs childId={child.id} childName={child.name} />
        </div>
      </div>
    </Shell>
  );
}
