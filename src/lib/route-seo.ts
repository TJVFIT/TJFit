import type { Locale } from "@/lib/i18n";

export type RouteSeoKey = "programs" | "diets" | "coaches" | "ai" | "calculator" | "blog" | "membership" | "community";

const EN_ROUTE_SEO: Record<RouteSeoKey, { title: string; description: string }> = {
  programs: {
    title: "Fitness Programs — 12-Week Training Plans | TJFit",
    description:
      "Browse expert 12-week training programs for fat loss, muscle building, and home workouts. Free preview available. Start training today."
  },
  diets: {
    title: "Nutrition & Diet Plans — Built by Experts | TJFit",
    description: "Science-backed diet plans built by coaches for fat loss, muscle gain, and long-term consistency."
  },
  coaches: {
    title: "Find Your Certified Fitness Coach | TJFit",
    description:
      "Find certified fitness coaches specializing in fat loss, muscle building, nutrition, and rehabilitation. Available in English, Turkish, and Arabic."
  },
  ai: {
    title: "TJAI — Your AI Fitness & Nutrition Coach | TJFit",
    description:
      "Meet TJAI — the AI that builds your complete 12-week fitness and nutrition plan in minutes. Personalized to your goals, body, and lifestyle."
  },
  calculator: {
    title: "Free TDEE Calculator — Find Your Daily Calories | TJFit",
    description: "Calculate TDEE, calories, macros, and hydration targets in under 60 seconds."
  },
  blog: {
    title: "Fitness Blog — Training, Nutrition & Mindset | TJFit",
    description: "Read practical fitness, nutrition, and mindset guides from TJFit coaches and experts."
  },
  membership: {
    title: "Upgrade Your Plan — Pro & Apex | TJFit",
    description: "Compare TJFit Pro and Apex tiers and unlock AI tools, plan generation, and member benefits."
  },
  community: {
    title: "TJFit Community — Train Together | TJFit",
    description: "Join the TJFit community for challenges, blog posts, transformations, and shared progress."
  }
};

const ROUTE_TITLE_OVERRIDES: Partial<Record<Locale, Partial<Record<RouteSeoKey, string>>>> = {
  tr: {
    programs: "Fitness Programları — 12 Haftalık Antrenman Planları | TJFit",
    ai: "TJAI — Yapay Zeka Fitness Koçunuz | TJFit"
  },
  ar: {
    ai: "TJAI — مدربك الذكاء الاصطناعي للياقة والتغذية | TJFit"
  }
};

export function getRouteSeo(locale: Locale, key: RouteSeoKey) {
  const base = EN_ROUTE_SEO[key];
  const title = ROUTE_TITLE_OVERRIDES[locale]?.[key] ?? base.title;
  return { title, description: base.description };
}
