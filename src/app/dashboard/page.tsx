import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { RoadmapHome } from "@/components/easy/RoadmapHome";
import { computeRoadmap } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle<ChildProfile>();
  if (childError)
    throw new Error("We couldn’t load your profile. Please try again.");
  if (!child) redirect("/onboarding");
  const [parentResult, sessionsResult, skillsResult] = await Promise.all([
    supabase
      .from("parents")
      .select("name")
      .eq("id", user.id)
      .maybeSingle<{ name: string | null }>(),
    supabase
      .from("sessions")
      .select("*")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .returns<Session[]>(),
    supabase
      .from("skills")
      .select("*")
      .eq("child_id", child.id)
      .returns<Skill[]>(),
  ]);
  if (sessionsResult.error || skillsResult.error)
    throw new Error("We couldn’t load your roadmap. Please try again.");
  const sessions = sessionsResult.data ?? [];
  const roadmap = computeRoadmap({
    skills: skillsResult.data ?? [],
    sessions,
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  }).filter((r) => r.area.subject !== "writing");
  return (
    <Shell wide>
      <RoadmapHome
        childName={child.name}
        parentName={parentResult.data?.name}
        interests={child.interests}
        summary={child.summary}
        roadmap={roadmap}
        latestMessage={
          sessions.find((s) => s.checkin && s.micro_message)?.micro_message
        }
      />
    </Shell>
  );
}
