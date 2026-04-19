import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { isAdminEmail } from "@/lib/auth-utils";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "TJAI — AI Fitness & Nutrition Coach | TJFit",
  description:
    "TJAI: complete an adaptive assessment for a personalized preview, then unlock your full 12-week fitness and nutrition plan.",
  keywords: ["AI fitness coach", "AI personal trainer", "AI nutrition plan", "AI workout plan"]
};

export default function TjaiLandingPage({ params }: { params: { locale: string } }) {
  return <TjaiLandingPageContent params={params} />;
}

async function TjaiLandingPageContent({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
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
