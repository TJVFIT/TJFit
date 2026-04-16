import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

function computeStreak(dateSet: Set<string>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
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

  const [ordersRes, entryCountRes, entryRowsRes, milestonesRes, workoutDatesRes] = await Promise.all([
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
      .limit(365),
    auth.supabase.from("progress_milestones").select("id", { count: "exact", head: true }).eq("user_id", uid),
    auth.supabase
      .from("workout_logs")
      .select("workout_date")
      .eq("user_id", uid)
      .order("workout_date", { ascending: false })
      .limit(365)
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
