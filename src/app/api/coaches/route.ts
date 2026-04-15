import { NextRequest, NextResponse } from "next/server";

import { searchNormalize } from "@/lib/turkish-chars";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const q = searchNormalize(request.nextUrl.searchParams.get("q") ?? "");
  const specialty = searchNormalize(request.nextUrl.searchParams.get("specialty") ?? "");
  const acceptingOnly = request.nextUrl.searchParams.get("accepting") === "1";

  const { data: baseRows, error } = await admin
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,specialty_tags,accepting_clients")
    .eq("role", "coach")
    .order("id", { ascending: true })
    .limit(120);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (baseRows ?? []).map((row) => ({
    ...row,
    specialty_tags: row.specialty_tags ?? [],
    accepting_clients: row.accepting_clients ?? true,
    current_streak: 0
  }));

  let filtered = rows;
  if (q) {
    filtered = filtered.filter((row) => {
      const text = searchNormalize(`${row.display_name ?? ""} ${row.username ?? ""}`);
      return text.includes(q);
    });
  }
  if (specialty) {
    filtered = filtered.filter((row) => (row.specialty_tags ?? []).some((tag: string) => searchNormalize(tag).includes(specialty)));
  }
  if (acceptingOnly) {
    filtered = filtered.filter((row) => row.accepting_clients !== false);
  }

  const ids = filtered.map((row) => row.id);
  const [{ data: blogRows }, { data: reviewRows }, { data: salesRows }] = await Promise.all([
    ids.length ? admin.from("community_blog_posts").select("author_id").in("author_id", ids).eq("status", "published") : { data: [] as any[] },
    ids.length ? admin.from("program_reviews").select("user_id,rating").in("user_id", ids).eq("is_hidden", false) : { data: [] as any[] },
    ids.length ? admin.from("program_orders").select("coach_id,user_id,program_slug").in("coach_id", ids).eq("status", "paid") : { data: [] as any[] }
  ]);

  const byCoach = new Map<
    string,
    {
      students: Set<string>;
      programs: Set<string>;
      ratings: number[];
      blogs: number;
    }
  >();
  for (const row of filtered) {
    byCoach.set(row.id, { students: new Set(), programs: new Set(), ratings: [], blogs: 0 });
  }
  for (const row of blogRows ?? []) {
    const item = byCoach.get(row.author_id);
    if (item) item.blogs += 1;
  }
  for (const row of reviewRows ?? []) {
    const item = byCoach.get(row.user_id);
    if (item) item.ratings.push(Number(row.rating ?? 0));
  }
  for (const row of salesRows ?? []) {
    const item = byCoach.get(row.coach_id);
    if (!item) continue;
    item.students.add(String(row.user_id));
    item.programs.add(String(row.program_slug ?? ""));
  }

  const coaches = filtered.map((row) => {
    const stat = byCoach.get(row.id);
    const avg = stat && stat.ratings.length > 0 ? stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length : 0;
    return {
      ...row,
      stats: {
        students: stat?.students.size ?? 0,
        programs: stat?.programs.size ?? 0,
        average_rating: Number(avg.toFixed(1)),
        blog_posts: stat?.blogs ?? 0
      }
    };
  });

  const res = NextResponse.json({ coaches });
  // Coaches list changes infrequently — cache for 5 min, serve stale for 10 min while revalidating
  res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res;
}
