import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { title, author } = body as { title?: string; author?: string };
  if (!title?.trim()) {
    return NextResponse.json({ error: "Missing book title." }, { status: 400 });
  }

  const { data: book, error } = await supabase
    .from("books")
    .update({ title: title.trim(), author: author?.trim() || null })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !book) {
    return NextResponse.json({ error: "Couldn't find that book to update." }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: deleted, error } = await supabase.from("books").delete().eq("id", id).select("id").single();

  if (error || !deleted) {
    return NextResponse.json({ error: "Couldn't find that book to delete." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
