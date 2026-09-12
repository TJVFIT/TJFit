import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { isAdminEmail } from "@/lib/auth-utils";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  const copy = PUBLIC_COPY[locale];
  return {
    title: `TJAI — ${copy.passTitle} | TJFit`,
    description: copy.passIntro,
    keywords: ["AI fitness coach", "AI personal trainer", "AI nutrition plan", "AI workout plan"]
  };
}

export default async function TjaiLandingPage(
  props: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ from?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return <TjaiLandingPageContent params={params} fromAi={searchParams?.from === "ai"} />;
}

async function TjaiLandingPageContent({ params, fromAi }: { params: { locale: string }; fromAi: boolean }) {
  const locale = requireLocaleParam(params.locale);
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    // Skip the redirect-to-hub when /ai bounced the user here for lacking
    // hub access — otherwise /ai → /tjai → /ai loops forever. With from=ai
    // we render the landing (upsell) instead.
    if (!error && user?.id && !fromAi) {
      const isAdminByEmail = Boolean(user.email && isAdminEmail(user.email));
      const role = isAdminByEmail
        ? "admin"
        : (await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()).data?.role;
      if (role === "admin" || role === "coach" || role === "user") {
        redirect(`/${locale}/ai`);
      }
    }
  } catch {
    /* fall through to public landing */
  }

  return <TjaiPublicLanding locale={locale} />;
}
