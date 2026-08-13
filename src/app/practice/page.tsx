import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { PracticeFlow } from "@/components/homework/PracticeFlow";
import { computeRoadmap } from "@/lib/roadmap";
import type { ChildProfile, Session, Skill } from "@/lib/types";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; topic?: string; reason?: string }>;
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

  const { subject, topic, reason } = await searchParams;

  const [{ data: sessions }, { data: skills }] = await Promise.all([
    supabase.from("sessions").select("*").eq("child_id", child.id).returns<Session[]>(),
    supabase.from("skills").select("*").eq("child_id", child.id).returns<Skill[]>(),
  ]);
  const roadmap = computeRoadmap({
    skills: skills ?? [],
    sessions: sessions ?? [],
    strengths: child.strengths ?? [],
    growthAreas: child.growth_areas ?? [],
  });

  return (
    <Shell>
      <PracticeFlow
        childId={child.id}
        childName={child.name}
        roadmap={roadmap}
        initialSubject={subject}
        initialTopic={topic}
        initialReason={reason}
      />
    </Shell>
  );
}
