import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth-utils";
import { getBundle } from "@/lib/bundles";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";
import { requireLocaleParam } from "@/lib/require-locale";
import { ProgramApp } from "./program-app";

export const dynamic = "force-dynamic";

export default async function ProgramPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocaleParam(localeParam);
  const path = `/${locale}/bundles/${slug}/program`;
  const { supabase, user } = await requireAuthenticatedUser(locale, path);

  const bundle = getBundle(slug);
  if (!bundle) notFound();
  const admin = !!user.email && isAdminEmail(user.email);
  if (!admin) {
    const paid = await hasPurchasedProgram(supabase, user.id, bundle.slug);
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
      bundle={bundle}
      currentWeek={currentWeek}
      logs={logs ?? []}
      grocery={(groceryRows ?? []).filter((r) => r.checked).map((r) => r.item_key)}
    />
  );
}
