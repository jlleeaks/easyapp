import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { HomeworkHub } from "@/components/homework/HomeworkHub";
import { computeRoadmap } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; session?: string }>;
}) {
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

  const [{ data: sessions }, { data: skills }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("child_id", child.id)
      .neq("source", "library")
      .order("created_at", { ascending: false })
      .returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", child.id).returns<Skill[]>(),
  ]);

  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions: sessions ?? [],
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });

  const { subject, session } = await searchParams;

  return (
    <Shell wide>
      <HomeworkHub
        childId={child.id}
        childName={child.name}
        sessions={sessions ?? []}
        roadmap={roadmap}
        initialSubject={subject}
        initialSessionId={session}
      />
    </Shell>
  );
}
