import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const slug = decodeURIComponent(params.slug ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const { data: coachBase } = await admin
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio")
    .eq("role", "coach")
    .eq("username_normalized", slug)
    .maybeSingle();
  if (!coachBase) return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  const { data: coachExtras } = await admin
    .from("profiles")
    .select("id,about_me,specialty_tags,certifications,accepting_clients,featured_program_id")
    .eq("id", coachBase.id)
    .maybeSingle();
  const coach = {
    ...coachBase,
    about_me: coachExtras?.about_me ?? null,
    specialty_tags: (coachExtras?.specialty_tags as string[] | null) ?? [],
    certifications: (coachExtras?.certifications as string[] | null) ?? [],
    accepting_clients: coachExtras?.accepting_clients ?? true,
    featured_program_id: coachExtras?.featured_program_id ?? null
  };

  const [{ count: studentCount }, { count: reviewCount }, { data: ratings }, { count: blogPostCount }, { data: blogViews }, { count: programCount }] =
    await Promise.all([
      admin.from("program_orders").select("user_id", { head: true, count: "exact" }).eq("status", "paid").eq("coach_id", coach.id),
      admin.from("program_reviews").select("id", { head: true, count: "exact" }).eq("user_id", coach.id).eq("is_hidden", false),
      admin.from("program_reviews").select("rating").eq("user_id", coach.id).eq("is_hidden", false),
      admin.from("community_blog_posts").select("id", { head: true, count: "exact" }).eq("author_id", coach.id).eq("status", "published"),
      admin.from("community_blog_posts").select("views").eq("author_id", coach.id).eq("status", "published"),
      admin.from("program_orders").select("program_slug", { head: true, count: "exact" }).eq("coach_id", coach.id)
    ]);

  const avgRating =
    ratings && ratings.length > 0 ? ratings.reduce((acc, item) => acc + Number(item.rating ?? 0), 0) / ratings.length : 0;
  const totalViews = (blogViews ?? []).reduce((acc, item) => acc + Number(item.views ?? 0), 0);

  return NextResponse.json({
    coach,
    stats: {
      student_count: Number(studentCount ?? 0),
      program_count: Number(programCount ?? 0),
      average_rating: Number(avgRating.toFixed(1)),
      review_count: Number(reviewCount ?? 0),
      blog_post_count: Number(blogPostCount ?? 0),
      blog_view_count: Number(totalViews)
    }
  });
}
