import { NextRequest, NextResponse } from "next/server";

import { programs } from "@/lib/content";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { searchNormalize } from "@/lib/turkish-chars";

function match(text: string, q: string) {
  return searchNormalize(text).includes(q);
}

export async function GET(request: NextRequest) {
  const admin = getSupabaseServerClient();
  const qRaw = request.nextUrl.searchParams.get("q") ?? "";
  const q = searchNormalize(qRaw);
  if (q.length < 2) {
    return NextResponse.json({ results: { programs: [], diets: [], coaches: [], blog: [], users: [] } });
  }

  const staticPrograms = programs
    .filter((item) => match(`${item.title} ${item.description} ${item.category}`, q))
    .slice(0, 6)
    .map((item) => ({ id: item.slug, title: item.title, href: `/programs/${item.slug}` }));
  const staticDiets = programs
    .filter((item) => item.category.toLowerCase().includes("nutrition") && match(`${item.title} ${item.description} ${item.category}`, q))
    .slice(0, 6)
    .map((item) => ({ id: item.slug, title: item.title, href: `/programs/${item.slug}` }));

  if (!admin) {
    return NextResponse.json({
      results: { programs: staticPrograms.slice(0, 3), diets: staticDiets.slice(0, 3), coaches: [], blog: [], users: [] }
    });
  }

  const [{ data: coaches }, { data: users }, { data: blog }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,username,display_name,specialty_tags")
      .eq("role", "coach")
      .limit(50),
    admin.from("profiles").select("id,username,display_name,privacy_settings").limit(80),
    admin.from("community_blog_posts").select("id,title,status").eq("status", "published").limit(80)
  ]);

  return NextResponse.json({
    results: {
      programs: staticPrograms.slice(0, 3),
      diets: staticDiets.slice(0, 3),
      coaches: (coaches ?? [])
        .filter((row) => match(`${row.display_name ?? ""} ${row.username ?? ""} ${(row.specialty_tags ?? []).join(" ")}`, q))
        .slice(0, 3)
        .map((row) => ({ id: row.id, title: row.display_name || `@${row.username}`, href: `/coaches/${row.username}` })),
      blog: (blog ?? [])
        .filter((row) => match(String(row.title ?? ""), q))
        .slice(0, 3)
        .map((row) => ({ id: String(row.id), title: String(row.title), href: `/blog/${row.id}` })),
      users: (users ?? [])
        .filter((row) => match(`${row.display_name ?? ""} ${row.username ?? ""}`, q))
        .slice(0, 3)
        .map((row) => ({ id: row.id, title: row.display_name || `@${row.username}`, href: `/profile/${row.username}` }))
    }
  });
}
