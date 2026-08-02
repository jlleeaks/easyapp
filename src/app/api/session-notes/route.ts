import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { sessionId, notes } = body as { sessionId: string; notes: string };
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
  }

  // RLS ensures this only succeeds if the session belongs to one of this parent's children.
  const { error } = await supabase
    .from("sessions")
    .update({ parent_notes: notes ?? "" })
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Couldn't save that note — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
