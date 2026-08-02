import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, Heart, ThumbsUp, Target, Brain, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Avatar, Chip, Card, Eyebrow } from "@/components/ui/primitives";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import { ProfileInsightSection } from "@/components/profile/ProfileInsightSection";
import { AddInformationButton } from "@/components/profile/AddInformationButton";
import { EmptyState, BuildingPictureArt } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { STANDARDS_FRAMEWORK } from "@/lib/standards";
import type { ChildProfile } from "@/lib/types";

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
  const engagementPatterns = patterns.filter((p) => p.parent_response || p.helped !== null);

  const reportOrAssignmentCount = [...strengths, ...growthAreas].filter(
    (i) => i.source === "report_card" || i.source === "assignment",
  ).length;
  const teacherCount = [...strengths, ...growthAreas, ...patterns].filter((i) => i.source === "teacher").length;
  const parentObservationCount = patterns.filter((p) => p.source === "parent").length;
  const totalSources = reportOrAssignmentCount + teacherCount + (libraryCheckinCount ?? 0) + parentObservationCount;

  const academicPictureEmpty = strengths.length === 0 && growthAreas.length === 0 && engagementPatterns.length === 0;

  const howTheyLearnFacts = [child.frustration, child.learning_style, child.motivation, child.shy].filter(Boolean);
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
        className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 mb-4 animate-fade-in-up"
        style={{ borderBottom: `1px solid ${PALETTE.line}` }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar name={child.name} size={60} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="font-serif-display" style={{ fontSize: 30, fontWeight: 700, color: PALETTE.accent, letterSpacing: "-0.01em" }}>
                {child.name}
              </h1>
              <Chip color={PALETTE.brandSoft}>Kindergarten</Chip>
            </div>
            <p className="text-xs mt-1" style={{ color: PALETTE.inkFaint }}>
              Updated <LocalDateLabel iso={child.updated_at} options={{ month: "long", day: "numeric" }} />
            </p>
          </div>
        </div>
        <Link href="/onboarding" className="flex-shrink-0">
          <div
            className="btn-press flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-semibold border transition-all duration-150"
            style={{ borderRadius: RADIUS.sm, borderColor: PALETTE.line, color: PALETTE.ink, background: PALETTE.card }}
          >
            <Pencil size={14} /> Edit profile
          </div>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>
          Built from parent setup{totalSources > 0 ? ` and ${totalSources} check-in${totalSources === 1 ? "" : "s"}` : ""}
          {" "}
          · <a href="#academic-picture" className="font-semibold underline" style={{ color: PALETTE.inkSoft }}>Manage sources</a>
          {" "}· {STANDARDS_FRAMEWORK.grade} · {STANDARDS_FRAMEWORK.name}
        </p>
        <AddInformationButton childId={child.id} childName={child.name} />
      </div>

      <div id="academic-picture" className="mb-6">
        <SectionHeading icon={<ThumbsUp size={15} color={PALETTE.brand} />}>Current academic picture</SectionHeading>
        {academicPictureEmpty ? (
          <Card style={{ marginBottom: 0 }}>
            <EmptyState
              icon={<BuildingPictureArt />}
              title={`Easy is still building ${child.name}'s academic picture`}
              body="Complete an activity, upload schoolwork, or add something a teacher shared."
              action={<AddInformationButton childId={child.id} childName={child.name} />}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <ProfileInsightSection
              childId={child.id}
              field="strengths"
              title="Strengths & current skills"
              icon={<ThumbsUp size={13} color={PALETTE.brand} />}
              color={PALETTE.brand}
              items={strengths}
              emptyText="Nothing yet in this section."
            />
            <ProfileInsightSection
              childId={child.id}
              field="growth_areas"
              title="Developing now"
              icon={<Target size={13} color={PALETTE.gold} />}
              color={PALETTE.gold}
              items={growthAreas}
              emptyText="Nothing yet in this section."
            />
            <ProfileInsightSection
              childId={child.id}
              field="learning_patterns"
              title={`How ${child.name} learns`}
              icon={<Brain size={13} color={PALETTE.accent} />}
              color={PALETTE.accent}
              items={engagementPatterns}
              emptyText="Nothing yet in this section."
            />
          </div>
        )}
      </div>

      {(howTheyLearnFacts.length > 0 || hasInterests || routineFacts.length > 0) && (
        <div>
          <SectionHeading>About {child.name}</SectionHeading>
          <Card style={{ marginBottom: 0 }}>
            <div className="p-5 flex flex-col gap-5">
              {howTheyLearnFacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart size={12} color={PALETTE.accent} />
                    <Eyebrow color={PALETTE.accent}>What motivates her</Eyebrow>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {howTheyLearnFacts.map((f, i) => (
                      <Chip key={i}>{f}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {hasInterests && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart size={12} color={PALETTE.gold} />
                    <Eyebrow color={PALETTE.gold}>Interests</Eyebrow>
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
                      <div key={f.label}>
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
    </Shell>
  );
}
