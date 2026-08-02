import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUGGEST_FOCUS_SYSTEM, callClaude, childProfileForPrompt, parseJSON } from "@/lib/anthropic";
import type { ChildProfile, Subject } from "@/lib/types";

type Suggestion = { subject: Subject; focus: string; reason: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId } = body as { childId: string };
  if (!childId) {
    return NextResponse.json({ error: "Missing childId." }, { status: 400 });
  }

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();
  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: skills } = await supabase.from("skills").select("subject, skill_name, stage").eq("child_id", childId);

  try {
    const text = await callClaude({
      system: SUGGEST_FOCUS_SYSTEM,
      userContent: [
        {
          type: "text",
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nCurrently tracked skills: ${JSON.stringify(skills ?? [])}`,
        },
      ],
      maxTokens: 900,
    });

    const parsed = parseJSON<{ suggestions: Suggestion[] }>(text);
    if (!parsed?.suggestions?.length) {
      return NextResponse.json({ error: "Couldn't come up with suggestions — try again." }, { status: 502 });
    }

    return NextResponse.json({ suggestions: parsed.suggestions });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
