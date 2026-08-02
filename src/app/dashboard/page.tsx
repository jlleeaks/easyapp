import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PALETTE } from "@/lib/palette";
import { Shell } from "@/components/ui/Shell";
import { Wordmark } from "@/components/ui/primitives";
import { HomeGreeting } from "@/components/ui/HomeGreeting";
import { TonightActivityHero, SecondaryActionTile } from "@/components/ui/TonightActivityCard";
import { NoticingStrip } from "@/components/ui/NoticingStrip";
import { ContinueLastTime } from "@/components/ui/ContinueLastTime";
import { ThisWeekCard } from "@/components/ui/ThisWeekCard";
import { getTonightSuggestions } from "@/lib/suggestions";
import { areaForFocusText, computeRoadmap } from "@/lib/roadmap";
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

  const { data: parent } = await supabase
    .from("parents")
    .select("name")
    .eq("id", user.id)
    .maybeSingle<{ name: string | null }>();

  const [{ data: allSessions }, { data: skills }] = await Promise.all([
    supabase.from("sessions").select("*").eq("child_id", child.id).order("created_at", { ascending: false }).returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", child.id).returns<Skill[]>(),
  ]);
  const sessions = allSessions ?? [];

  // Resolve tonight's suggestion server-side (no client loading delay) and ground
  // its "why" against the same roadmap state Progress shows, so the two can't disagree.
  let suggestion = null;
  let suggestionArea = null;
  try {
    const suggestions = await getTonightSuggestions(child, skills ?? [], sessions);
    suggestion = suggestions?.[0] ?? null;
    if (suggestion) {
      suggestionArea = areaForFocusText(suggestion.subject, suggestion.focus);
    }
  } catch {
    suggestion = null;
  }

  const continuation = sessions.slice(0, 3).find((s) => s.micro_message?.trim()) ?? null;

  const patterns = child.learning_patterns ?? [];
  const noticing = patterns.length > 0 ? patterns[0] : null;

  // "This week" summary — grounded in the same roadmap engine Progress uses, so
  // Home never states a subject/state that Progress would contradict.
  const weekCutoff = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
  const activitiesThisWeek = sessions.filter((s) => new Date(s.created_at).getTime() >= weekCutoff).length;

  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions,
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });
  const withEvidence = roadmap.filter((a) => a.evidence.length > 0);
  const notYetComfortable = withEvidence.filter((a) => a.state !== "comfortable" && a.state !== "ready_to_extend");
  const focusItem =
    [...notYetComfortable].sort((a, b) => b.evidence.length - a.evidence.length)[0] ??
    [...withEvidence].sort((a, b) => b.evidence.length - a.evidence.length)[0] ??
    null;

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <Wordmark small />
      </div>

      <HomeGreeting parentName={parent?.name} childName={child.name} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TonightActivityHero childName={child.name} suggestion={suggestion} area={suggestionArea} />
        </div>
        <ThisWeekCard
          childName={child.name}
          activitiesThisWeek={activitiesThisWeek}
          focusSubject={focusItem?.area.subject ?? null}
          focusState={focusItem?.state ?? null}
          nextFocusLabel={focusItem?.area.area ?? null}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="flex flex-wrap gap-2.5">
          <SecondaryActionTile href="/homework" icon={<Camera size={16} />} label="Upload homework" />
          <SecondaryActionTile href="/practice" icon={<Sparkles size={16} />} label="Choose another activity" />
          <SecondaryActionTile href="/library" icon={<BookOpen size={16} />} label="Read together" />
        </div>
        <Link href="/chat" className="text-xs font-bold underline whitespace-nowrap" style={{ color: PALETTE.brand }}>
          Not sure what {child.name} needs? Ask Easy
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <NoticingStrip pattern={noticing} />
        <ContinueLastTime session={continuation} />
      </div>
    </Shell>
  );
}
