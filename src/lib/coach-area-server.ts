import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth-utils";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import type { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { URL_NOTICE } from "@/lib/url-notice";

export type EffectiveServerRole = "admin" | "coach" | "user" | null;

export async function resolveEffectiveServerRole(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  email: string | undefined
): Promise<EffectiveServerRole> {
  if (email && isAdminEmail(email)) return "admin";
  const { data: profileRow } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profileRow?.role === "admin") return "admin";
  if (profileRow?.role === "coach") return "coach";
  return "user";
}

function isRedirectError(e: unknown) {
  return typeof e === "object" && e !== null && "digest" in e && String((e as { digest?: string }).digest).includes("NEXT_REDIRECT");
}

/**
 * Coaches must accept the current terms version before using coach tools.
 * Admins and normal users are unaffected.
 */
export async function redirectCoachWithoutTermsIfNeeded(locale: Locale, nextPathWithLocale: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) return;

    const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
    if (role !== "coach") return;

    const expected = getCoachTermsVersion();
    const { data: row } = await supabase
      .from("coach_terms_acceptance")
      .select("terms_version")
      .eq("coach_id", user.id)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (row?.terms_version === expected) return;

    const nextParam = encodeURIComponent(nextPathWithLocale.startsWith("/") ? nextPathWithLocale : `/${nextPathWithLocale}`);
    redirect(`/${locale}/coach/terms?next=${nextParam}`);
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
}

/** Coach-only or admin-only routes (e.g. program upload). */
export async function gateCoachOrAdminRoute(locale: Locale, nextPathWithLocale: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) {
      redirect(`/${locale}/login?next=${encodeURIComponent(nextPathWithLocale)}`);
    }
    const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
    if (role !== "coach" && role !== "admin") {
      redirect(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_UPLOAD}`);
    }
    await redirectCoachWithoutTermsIfNeeded(locale, nextPathWithLocale);
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
}

export async function gateCoachDashboardRoute(locale: Locale): Promise<void> {
  const path = `/${locale}/coach-dashboard`;
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) {
      redirect(`/${locale}/login?next=${encodeURIComponent(path)}`);
    }
    const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
    if (role !== "coach" && role !== "admin") {
      redirect(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_COACH}`);
    }
    await redirectCoachWithoutTermsIfNeeded(locale, path);
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
}

export async function gateDashboardForCoachTerms(locale: Locale): Promise<void> {
  const path = `/${locale}/dashboard`;
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) return;
    const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
    if (role !== "coach") return;
    await redirectCoachWithoutTermsIfNeeded(locale, path);
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
}
