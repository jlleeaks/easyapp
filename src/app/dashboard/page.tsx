import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { Wordmark } from "@/components/ui/primitives";
import { HomeGreeting } from "@/components/ui/HomeGreeting";
import { TonightActivityHero } from "@/components/ui/TonightActivityCard";
import { WeeklyGoalsCard } from "@/components/ui/WeeklyGoalsCard";
import { TopOffWithStory } from "@/components/ui/TopOffWithStory";
import { GrowthMomentCard } from "@/components/ui/GrowthMomentCard";
import { BuildingTowardSection } from "@/components/ui/BuildingTowardSection";
import { AskEasyMiniPrompt } from "@/components/ui/AskEasyMiniPrompt";
import { deterministicWeeklyGoals, getSuggestedWeeklyGoals, getTonightSuggestions } from "@/lib/suggestions";
import { areaForFocusText, computeRoadmap, deterministicFallbackSuggestion, deterministicOtherActivities } from "@/lib/roadmap";
import type { Book, ChildProfile, Session, Skill } from "@/lib/types";

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

  const [{ data: allSessions }, { data: skills }, { data: books }] = await Promise.all([
    supabase.from("sessions").select("*").eq("child_id", child.id).order("created_at", { ascending: false }).returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", child.id).returns<Skill[]>(),
    supabase.from("books").select("*").eq("child_id", child.id).order("created_at", { ascending: false }).returns<Book[]>(),
  ]);
  const sessions = allSessions ?? [];

  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions,
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });

  // Resolve tonight's suggestion server-side (no client loading delay) and ground
  // its "why" against the same roadmap state Progress shows, so the two can't disagree.
  // Easy should suggest something no matter what — if the AI call fails or times out,
  // fall back to a deterministic, roadmap-grounded pick (optionally steered by the
  // parent's own stated weekly focus) rather than showing an empty state.
  let suggestions = null;
  try {
    suggestions = await getTonightSuggestions(child, skills ?? [], sessions);
  } catch {
    suggestions = null;
  }
  let suggestion = suggestions?.[0] ?? null;
  if (!suggestion) {
    suggestion = deterministicFallbackSuggestion(roadmap, child.weekly_goals?.focus_area);
  }
  const suggestionArea = areaForFocusText(suggestion.subject, suggestion.focus);

  // A parent who'd rather not do tonight's pick should see concrete, tailored alternatives —
  // not just an abstract goal counter. Reuse the AI's own multi-suggestion list when it's
  // there (no extra call), otherwise fall back to one deterministic pick per other subject.
  const otherRaw = suggestions && suggestions.length > 1 ? suggestions.slice(1, 3) : deterministicOtherActivities(roadmap, suggestion.subject);
  const otherActivities = otherRaw.map((a) => ({ ...a, area: areaForFocusText(a.subject, a.focus) }));

  // Weekly goals should be personalized by default, not an empty form the parent has to
  // fill in first — grounded in the same roadmap coverage Progress shows, so targets track
  // real ground left to cover before kindergarten ends. Only computed when the parent
  // hasn't already saved their own goals.
  let suggestedGoals = null;
  if (!child.weekly_goals) {
    try {
      suggestedGoals = await getSuggestedWeeklyGoals(child, sessions, roadmap);
    } catch {
      suggestedGoals = null;
    }
    if (!suggestedGoals) {
      suggestedGoals = deterministicWeeklyGoals(roadmap);
    }
  }

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <Wordmark small />
      </div>

      <HomeGreeting parentName={parent?.name} childName={child.name} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TonightActivityHero childName={child.name} suggestion={suggestion} area={suggestionArea} sessions={sessions} />
        </div>
        <WeeklyGoalsCard
          childId={child.id}
          childName={child.name}
          weeklyGoals={child.weekly_goals ?? null}
          suggestedGoals={suggestedGoals}
          otherActivities={otherActivities}
          sessions={sessions}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <TopOffWithStory childName={child.name} books={books ?? []} librarySessions={sessions.filter((s) => s.source === "library")} />
        <GrowthMomentCard childName={child.name} />
      </div>

      <div className="mt-6">
        <BuildingTowardSection childName={child.name} roadmap={roadmap} sessions={sessions} />
      </div>

      <div className="mt-6">
        <AskEasyMiniPrompt childName={child.name} />
      </div>
    </Shell>
  );
}
