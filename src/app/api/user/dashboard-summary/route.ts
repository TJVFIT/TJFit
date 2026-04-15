import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const uid = auth.user.id;

  const [ordersRes, entryCountRes, entryRowsRes, milestonesRes, profileRes] = await Promise.all([
    auth.supabase
      .from("program_orders")
      .select("program_slug,status,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20),
    auth.supabase.from("progress_entries").select("id", { count: "exact", head: true }).eq("user_id", uid),
    auth.supabase
      .from("progress_entries")
      .select("entry_date")
      .eq("user_id", uid)
      .order("entry_date", { ascending: false })
      .limit(3),
    auth.supabase.from("progress_milestones").select("id", { count: "exact", head: true }).eq("user_id", uid),
    auth.supabase.from("profiles").select("current_streak").eq("id", uid).maybeSingle()
  ]);

  const orders = ordersRes.data ?? [];
  const paidSlugs = orders
    .filter((o) => o.status === "paid" && typeof o.program_slug === "string")
    .map((o) => o.program_slug as string);
  const latestPaidSlug = paidSlugs[0] ?? null;

  const progressEntryCount = entryCountRes.error ? 0 : entryCountRes.count ?? 0;
  const entryRows = entryRowsRes.data ?? [];
  const recentEntryDates = entryRows
    .map((r) => (typeof r.entry_date === "string" ? r.entry_date : null))
    .filter((d): d is string => Boolean(d));

  const milestoneCount = milestonesRes.error ? 0 : milestonesRes.count ?? 0;
  const currentStreak = (profileRes.data as { current_streak?: number } | null)?.current_streak ?? 0;

  return NextResponse.json({
    latestPaidProgramSlug: latestPaidSlug,
    paidOrderCount: paidSlugs.length,
    progressEntryCount,
    milestoneCount,
    recentEntryDates,
    currentStreak
  });
}
