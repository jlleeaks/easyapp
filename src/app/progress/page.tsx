import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { ProgressTabs } from "@/components/progress/ProgressTabs";
import { RoadmapHeader } from "@/components/progress/RoadmapHeader";
import { computeRoadmap, type AreaRoadmap } from "@/lib/roadmap";
import { SUBJECTS } from "@/lib/subjects";
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

  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions: sessions ?? [],
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });

  const areasBySubject = {} as Record<Subject, AreaRoadmap[]>;
  for (const s of SUBJECTS) {
    areasBySubject[s.key] = roadmap.filter((r) => r.area.subject === s.key);
  }

  return (
    <Shell wide>
      <RoadmapHeader childName={child.name} roadmap={roadmap} />

      <ProgressTabs
        childName={child.name}
        areasBySubject={areasBySubject}
        patterns={child.learning_patterns ?? []}
        sessions={sessions ?? []}
        dates={dates}
      />
    </Shell>
  );
}
