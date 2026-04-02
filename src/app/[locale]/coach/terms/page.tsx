import { redirect } from "next/navigation";

import { CoachTermsAcceptClient } from "@/components/coach-terms-accept-client";
import { resolveEffectiveServerRole } from "@/lib/coach-area-server";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { URL_NOTICE } from "@/lib/url-notice";

function safeRedirectPath(locale: Locale, raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const fallback = `/${locale}/coach-dashboard`;
  if (!v || typeof v !== "string" || !v.startsWith("/")) {
    return fallback;
  }
  if (!v.startsWith(`/${locale}/`) || v.includes("//")) {
    return fallback;
  }
  return v;
}

export default async function CoachTermsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const locale = requireLocaleParam(params.locale);
  const redirectTo = safeRedirectPath(locale, searchParams.next);
  const termsVersion = getCoachTermsVersion();

  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/coach/terms`)}`);
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/coach/terms`)}`);
  }

  const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
  if (role !== "coach") {
    redirect(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_COACH}`);
  }

  const expected = termsVersion;
  const { data: row } = await supabase
    .from("coach_terms_acceptance")
    .select("terms_version")
    .eq("coach_id", user.id)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (row?.terms_version === expected) {
    redirect(redirectTo);
  }

  return <CoachTermsAcceptClient locale={locale} redirectTo={redirectTo} termsVersion={termsVersion} />;
}
