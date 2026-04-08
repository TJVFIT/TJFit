import type { Metadata } from "next";

import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { requireLocaleParam } from "@/lib/require-locale";

export const metadata: Metadata = {
  title: "TJAI — AI Fitness & Nutrition Coach | TJFit",
  description:
    "TJAI builds your complete 12-week fitness and nutrition plan in minutes. Personalized to your body, goals, and lifestyle. Try free today.",
  keywords: ["AI fitness coach", "AI personal trainer", "AI nutrition plan", "AI workout plan"]
};

export default function TjaiLandingPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return <TjaiPublicLanding locale={locale} />;
}
