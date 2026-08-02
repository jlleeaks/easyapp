import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPracticeSystem, callClaude, childProfileForPrompt, parseJSON } from "@/lib/anthropic";
import type { Briefing, ChildProfile, Subject } from "@/lib/types";

const VALID_SUBJECTS: Subject[] = ["math", "writing", "reading"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, subject, topic, reason } = body as {
    childId: string;
    subject: string;
    topic: string;
    reason?: string;
  };

  if (!childId || !topic?.trim()) {
    return NextResponse.json({ error: "Missing topic." }, { status: 400 });
  }
  const safeSubject: Subject = VALID_SUBJECTS.includes(subject as Subject) ? (subject as Subject) : "math";

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single<ChildProfile>();

  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  try {
    const text = await callClaude({
      system: buildPracticeSystem(safeSubject),
      userContent: [
        {
          type: "text",
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nTonight's ${safeSubject} focus: ${topic}${reason ? `\nWhy this, tonight: ${reason}` : ""}`,
        },
      ],
    });

    const briefing = parseJSON<Briefing>(text);
    if (!briefing) {
      return NextResponse.json({ error: "Couldn't build that lesson — try again." }, { status: 502 });
    }

    return NextResponse.json({ briefing });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong building tonight's lesson. Try again." },
      { status: 502 },
    );
  }
}
