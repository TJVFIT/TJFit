import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidUsername } from "@/lib/username";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  const supabase = createServerSupabaseClient();
  const raw = decodeURIComponent(params.username ?? "").trim();
  if (!raw || !isValidUsername(raw)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_profile_card", { p_username: raw });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}
