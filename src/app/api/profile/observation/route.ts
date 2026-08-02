import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChildProfile, LearningPattern, Subject } from "@/lib/types";

const VALID_SUBJECTS: Subject[] = ["math", "writing", "reading"];
const MAX_PATTERNS = 50;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, observation, context, subject, useForPersonalization } = body as {
    childId: string;
    observation: string;
    context?: string;
    subject?: string;
    useForPersonalization?: boolean;
  };

  if (!childId || !observation?.trim()) {
    return NextResponse.json({ error: "Add what happened first." }, { status: 400 });
  }
  const safeSubject: Subject | "general" = VALID_SUBJECTS.includes(subject as Subject) ? (subject as Subject) : "general";

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();

  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const entry: LearningPattern = {
    id: crypto.randomUUID(),
    subject: safeSubject,
    observation: observation.trim(),
    trigger: context?.trim() || null,
    parent_response: null,
    helped: null,
    source: "parent",
    created_at: new Date().toISOString(),
    used_for_personalization: useForPersonalization !== false,
  };

  const merged = [entry, ...(child.learning_patterns ?? [])].slice(0, MAX_PATTERNS);

  const { error: updateError } = await supabase
    .from("children")
    .update({ learning_patterns: merged })
    .eq("id", childId);

  if (updateError) {
    console.error("[profile/observation] failed", updateError);
    return NextResponse.json({ error: "Couldn't save that — try again." }, { status: 502 });
  }

  return NextResponse.json({ items: merged });
}
