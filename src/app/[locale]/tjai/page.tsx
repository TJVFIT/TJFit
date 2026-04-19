import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ComingSoonLaunchPage } from "@/components/coming-soon-launch-page";
import { resolveEffectiveServerRole } from "@/lib/coach-area-server";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "TJAI — AI Fitness & Nutrition Coach | TJFit",
  description:
    "TJAI: answer 25 questions for a free preview. Unlock your full personalized 12-week fitness and nutrition plan at checkout.",
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
      const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
      if (role === "admin") {
        redirect(`/${locale}/ai`);
      }
    }
  } catch {
    /* fall back to coming soon for non-admin and anonymous users */
  }

  return <ComingSoonLaunchPage locale={locale} page="ai" source="tjai-coming-soon-landing" />;
}
