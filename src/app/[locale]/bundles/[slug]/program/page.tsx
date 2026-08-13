import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth-utils";
import { getBundle } from "@/lib/bundles";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { ProgramApp } from "./program-app";

export const dynamic = "force-dynamic";

export default async function ProgramPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const path = `/${locale}/bundles/${params.slug}/program`;
  const { supabase, user } = await requireAuthenticatedUser(locale, path);

  const bundle = getBundle(params.slug);
  if (!bundle) notFound();
  const admin = !!user.email && isAdminEmail(user.email);
  if (!admin) {
    // program_orders is revoked from `authenticated` (migration
    // 20260723221731); read entitlement with the service client. user.id is
    // session-verified, so the row scope is unchanged. Fail closed: without
    // the service client we cannot prove entitlement, so deny access.
    const db = getSupabaseServerClient();
    const paid = db ? await hasPurchasedProgram(db, user.id, bundle.slug) : false;
    if (!paid) redirect(`/${locale}/bundles/${bundle.slug}`);
  }

  // Ensure enrollment exists.
  const { data: existing } = await supabase
    .from("program_enrollments")
    .select("current_week, started_at")
    .eq("user_id", user.id)
    .eq("bundle_slug", bundle.slug)
    .maybeSingle();

  let enrollment = existing;
  if (!enrollment) {
    const { data: created } = await supabase
      .from("program_enrollments")
      .insert({ user_id: user.id, bundle_slug: bundle.slug })
      .select("current_week, started_at")
      .single();
    enrollment = created;
  }

  const currentWeek = enrollment?.current_week ?? 1;

  const [{ data: logs }, { data: groceryRows }] = await Promise.all([
    supabase
      .from("bundle_workout_logs")
      .select("week, day, exercise, set_index, reps, weight, completed")
      .eq("user_id", user.id)
      .eq("bundle_slug", bundle.slug),
    supabase
      .from("grocery_checks")
      .select("item_key, checked")
      .eq("user_id", user.id)
      .eq("bundle_slug", bundle.slug)
  ]);

  return (
    <ProgramApp
      locale={locale}
      // English bundle ONLY — the tracker persists workout logs keyed by
      // `day`/`exercise` and grocery checks by `category|item`, so localizing
      // these strings would strand a user's progress on locale switch and
      // write orphaned duplicate rows (WP-CONTENT-01 slophunter must-fix).
      // Localizing the tracker needs display/key separation — a follow-up WP.
      bundle={bundle}
      currentWeek={currentWeek}
      logs={logs ?? []}
      grocery={(groceryRows ?? []).filter((r) => r.checked).map((r) => r.item_key)}
    />
  );
}
