import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { GrowthGarden } from "@/components/easy/GrowthGarden";
import { computeRoadmap } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";
export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: child, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle<ChildProfile>();
  if (error)
    throw new Error("We couldn’t load your progress. Please try again.");
  if (!child) redirect("/onboarding");
  const [skills, sessions] = await Promise.all([
    supabase
      .from("skills")
      .select("*")
      .eq("child_id", child.id)
      .returns<Skill[]>(),
    supabase
      .from("sessions")
      .select("*")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .returns<Session[]>(),
  ]);
  if (skills.error || sessions.error)
    throw new Error("We couldn’t load your learning story. Please try again.");
  const roadmap = computeRoadmap({
    skills: skills.data ?? [],
    sessions: sessions.data ?? [],
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });
  return (
    <Shell wide>
      <GrowthGarden
        childName={child.name}
        roadmap={roadmap}
        sessions={sessions.data ?? []}
      />
    </Shell>
  );
}
