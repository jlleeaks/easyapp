import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REPORT_INTAKE_SYSTEM, callClaude, childProfileForPrompt, parseJSON } from "@/lib/anthropic";
import type { ChildProfile } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

type IntakeResult = {
  updated_summary: string;
  strengths: string[];
  growth_areas: string[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, notes, imageBase64, mediaType } = body as {
    childId: string;
    notes?: string;
    imageBase64?: string;
    mediaType?: string;
  };

  if (!childId || (!notes?.trim() && !imageBase64)) {
    return NextResponse.json({ error: "Add a note or a photo first." }, { status: 400 });
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

  const allowedMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  const safeMediaType = (allowedMediaTypes as readonly string[]).includes(mediaType ?? "")
    ? (mediaType as (typeof allowedMediaTypes)[number])
    : "image/jpeg";

  try {
    const userContent: Anthropic.MessageParam["content"] = [
      {
        type: "text",
        text: `Child profile: ${JSON.stringify(childProfileForPrompt(child))}\nExisting cumulative summary: ${child.summary || "none yet"}\n${notes?.trim() ? `Parent's notes: ${notes.trim()}` : "The parent attached a photo instead of typing notes."}`,
      },
    ];
    if (imageBase64) {
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: safeMediaType, data: imageBase64 },
      });
    }

    const text = await callClaude({ system: REPORT_INTAKE_SYSTEM, userContent, maxTokens: 700 });
    const parsed = parseJSON<IntakeResult>(text);
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't make sense of that — try again." }, { status: 502 });
    }

    const { error: updateError } = await supabase
      .from("children")
      .update({ summary: parsed.updated_summary })
      .eq("id", childId);
    if (updateError) throw updateError;

    return NextResponse.json({
      updatedSummary: parsed.updated_summary,
      strengths: parsed.strengths,
      growthAreas: parsed.growth_areas,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong reading that — check your connection and try again." },
      { status: 502 },
    );
  }
}
