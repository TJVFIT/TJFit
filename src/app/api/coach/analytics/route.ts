import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: me } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (me?.role !== "coach" && me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const weekAgoIso = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [profileViews, weeklyProfileViews, orders, weeklyOrders, reviews, blogRows, topProgramRows] = await Promise.all([
    admin.from("coach_profile_views").select("id", { head: true, count: "exact" }).eq("coach_id", auth.user.id),
    admin.from("coach_profile_views").select("id", { head: true, count: "exact" }).eq("coach_id", auth.user.id).gte("viewed_at", weekAgoIso),
    admin.from("program_orders").select("user_id,amount,program_slug,created_at,status").eq("coach_id", auth.user.id).eq("status", "paid"),
    admin.from("program_orders").select("user_id,amount,program_slug,created_at,status").eq("coach_id", auth.user.id).eq("status", "paid").gte("created_at", weekAgoIso),
    admin.from("program_reviews").select("rating").eq("user_id", auth.user.id).eq("is_hidden", false),
    admin.from("community_blog_posts").select("views,created_at").eq("author_id", auth.user.id).eq("status", "published"),
    admin.from("program_orders").select("program_slug,status").eq("coach_id", auth.user.id).eq("status", "paid")
  ]);

  const allOrders = orders.data ?? [];
  const weeklyPaid = weeklyOrders.data ?? [];
  const distinctStudents = new Set(allOrders.map((o) => String(o.user_id)));
  const totalRevenue = allOrders.reduce((acc, row) => acc + Number(row.amount ?? 0), 0);
  const weeklyRevenue = weeklyPaid.reduce((acc, row) => acc + Number(row.amount ?? 0), 0);
  const avgRating =
    (reviews.data ?? []).length > 0
      ? (reviews.data ?? []).reduce((acc, row) => acc + Number(row.rating ?? 0), 0) / (reviews.data ?? []).length
      : 0;
  const blogViews = (blogRows.data ?? []).reduce((acc, row) => acc + Number(row.views ?? 0), 0);
  const weeklyBlogViews = (blogRows.data ?? []).filter((row) => new Date(row.created_at).getTime() >= new Date(weekAgoIso).getTime()).reduce((acc, row) => acc + Number(row.views ?? 0), 0);

  const programMap = new Map<string, number>();
  for (const row of topProgramRows.data ?? []) {
    const slug = String(row.program_slug ?? "unknown");
    programMap.set(slug, (programMap.get(slug) ?? 0) + 1);
  }
  const topProgram = [...programMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const weeks: Array<{ week: string; revenue: number }> = [];
  for (let i = 7; i >= 0; i -= 1) {
    const start = new Date(now.getTime() - i * 7 * 86400000);
    const end = new Date(start.getTime() + 7 * 86400000);
    const revenue = allOrders
      .filter((row) => {
        const t = new Date(row.created_at).getTime();
        return t >= start.getTime() && t < end.getTime();
      })
      .reduce((acc, row) => acc + Number(row.amount ?? 0), 0);
    weeks.push({ week: `${start.getUTCMonth() + 1}/${start.getUTCDate()}`, revenue });
  }

  return NextResponse.json({
    weekly: {
      profile_views: Number(weeklyProfileViews.count ?? 0),
      program_sales: weeklyPaid.length,
      revenue: weeklyRevenue,
      blog_views: weeklyBlogViews
    },
    all_time: {
      total_students: distinctStudents.size,
      total_earnings: totalRevenue,
      average_rating: Number(avgRating.toFixed(1)),
      programs_created: programMap.size,
      profile_views: Number(profileViews.count ?? 0),
      blog_views: blogViews
    },
    weekly_revenue: weeks,
    top_program: topProgram ? { slug: topProgram[0], sales: topProgram[1], rating: Number(avgRating.toFixed(1)) } : null
  });
}
