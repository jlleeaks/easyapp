import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChildProfile, ProfileInsight, LearningPattern } from "@/lib/types";

type Field = "strengths" | "growth_areas" | "learning_patterns";
const VALID_FIELDS: Field[] = ["strengths", "growth_areas", "learning_patterns"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { childId, field, id, action, text } = body as {
    childId: string;
    field: Field;
    id: string;
    action: "confirm" | "correct" | "remove";
    text?: string;
  };

  if (!childId || !VALID_FIELDS.includes(field) || !id || !action) {
    return NextResponse.json({ error: "Missing or invalid request." }, { status: 400 });
  }
  if (action === "correct" && !text?.trim()) {
    return NextResponse.json({ error: "Missing corrected text." }, { status: 400 });
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

  const current = (child[field] ?? []) as (ProfileInsight | LearningPattern)[];
  const idx = current.findIndex((item) => item.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Couldn't find that item — it may already be gone." }, { status: 404 });
  }

  let updated: (ProfileInsight | LearningPattern)[];
  if (action === "remove") {
    updated = current.filter((_, i) => i !== idx);
  } else {
    const item = { ...current[idx] };
    if (action === "confirm") {
      item.confirmed = "confirmed";
    } else {
      item.confirmed = "corrected";
      if ("observation" in item) {
        (item as LearningPattern).observation = text!.trim();
      } else {
        (item as ProfileInsight).text = text!.trim();
      }
    }
    updated = [...current];
    updated[idx] = item;
  }

  const { error: updateError } = await supabase
    .from("children")
    .update({ [field]: updated })
    .eq("id", childId);

  if (updateError) {
    return NextResponse.json({ error: "Couldn't save that change — try again." }, { status: 502 });
  }

  return NextResponse.json({ items: updated });
}
