import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui/Shell";
import { PracticeFlow } from "@/components/homework/PracticeFlow";
import type { ChildProfile } from "@/lib/types";

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

  return (
    <Shell>
      <PracticeFlow childId={child.id} childName={child.name} initialSubject={subject} initialTopic={topic} initialReason={reason} />
    </Shell>
  );
}
