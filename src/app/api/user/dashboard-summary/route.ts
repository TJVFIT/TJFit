import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Dashboard streak ceiling. Streak rendering above this is handled by the
// badge system (100-day streak badge, etc.), so we don't need to scan the
// full year on every dashboard load. 90 days is the sweet spot: cheap query
// for the average user (small handful of active days), generous enough that
// real engagement gets correct credit on the dashboard headline number.
const STREAK_WINDOW_DAYS = 90;

function computeStreak(dateSet: Set<string>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < STREAK_WINDOW_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (dateSet.has(iso)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const uid = auth.user.id;

  // program_orders is revoked from the `authenticated` role (security
  // hardening migration 20260723221731) because the Data API would expose
  // columns the scoped APIs omit. Read it with the service client and keep
  // the user scope explicit in the query below.
  const ordersDb = getSupabaseServerClient();
  if (!ordersDb) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [ordersRes, entryCountRes, entryRowsRes, milestonesRes, workoutDatesRes] = await Promise.all([
    ordersDb
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
      .limit(STREAK_WINDOW_DAYS),
    auth.supabase.from("progress_milestones").select("id", { count: "exact", head: true }).eq("user_id", uid),
    auth.supabase
      .from("workout_logs")
      .select("workout_date")
      .eq("user_id", uid)
      .order("workout_date", { ascending: false })
      .limit(STREAK_WINDOW_DAYS)
  ]);

  const orders = ordersRes.data ?? [];
  const paidSlugs = orders
    .filter((o) => o.status === "paid" && typeof o.program_slug === "string")
    .map((o) => o.program_slug as string);
  const latestPaidSlug = paidSlugs[0] ?? null;

  const progressEntryCount = entryCountRes.error ? 0 : entryCountRes.count ?? 0;
  const entryRows = entryRowsRes.data ?? [];
  const recentEntryDates = entryRows
    .slice(0, 3)
    .map((r) => (typeof r.entry_date === "string" ? r.entry_date : null))
    .filter((d): d is string => Boolean(d));

  const milestoneCount = milestonesRes.error ? 0 : milestonesRes.count ?? 0;

  // Build a set of all active dates (both progress entries and workout logs)
  const activeDates = new Set<string>();
  for (const r of entryRows) {
    if (typeof r.entry_date === "string") activeDates.add(r.entry_date.slice(0, 10));
  }
  for (const r of (workoutDatesRes.data ?? [])) {
    if (typeof r.workout_date === "string") activeDates.add(r.workout_date.slice(0, 10));
  }
  const currentStreak = computeStreak(activeDates);

  return NextResponse.json({
    latestPaidProgramSlug: latestPaidSlug,
    paidOrderCount: paidSlugs.length,
    progressEntryCount,
    milestoneCount,
    recentEntryDates,
    currentStreak
  });
}
