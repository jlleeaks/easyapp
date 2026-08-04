import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDiagnosisSystem, callClaudeJSON, childProfileForPrompt } from "@/lib/anthropic";
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
  const { childId, imageBase64, mediaType, subject } = body as {
    childId: string;
    imageBase64: string;
    mediaType: string;
    subject: string;
  };

  if (!childId || !imageBase64) {
    return NextResponse.json({ error: "Missing childId or image." }, { status: 400 });
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

  const allowedMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  const safeMediaType = (allowedMediaTypes as readonly string[]).includes(mediaType)
    ? (mediaType as (typeof allowedMediaTypes)[number])
    : "image/jpeg";

  try {
    const briefing = await callClaudeJSON<Briefing>({
      system: buildDiagnosisSystem(safeSubject),
      userContent: [
        {
          type: "text",
          text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\n\nHere's a photo of tonight's ${safeSubject} assignment.`,
        },
        {
          type: "image",
          source: { type: "base64", media_type: safeMediaType, data: imageBase64 },
        },
      ],
      maxTokens: 2400,
    });

    if (!briefing) {
      return NextResponse.json(
        { error: "Couldn't read the worksheet — try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ briefing });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong looking at the worksheet. Try again." },
      { status: 502 },
    );
  }
}
