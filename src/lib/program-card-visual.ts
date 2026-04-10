import type { Program } from "@/lib/content";

export type ProgramVisual = {
  gradient: string;
  glow: string;
  ring: string;
  tag: string;
  accentColor: string;
};

/**
 * Category-driven hero gradient with distinctive color identities:
 * - Fat Loss: orange/red — warm urgency
 * - Muscle/Mass: cyan/violet — power
 * - Home Training: emerald/green — accessible
 * - Nutrition/Diet: teal/cyan — health
 * - General: indigo/violet
 */
export function getProgramVisual(program: Pick<Program, "category" | "slug">): ProgramVisual {
  const category = (program.category ?? "").toLowerCase();
  const slug = ((program as { slug?: string }).slug ?? "").toLowerCase();

  const isHome = slug.startsWith("home") || category.includes("home");

  if (category.includes("fat") || category.includes("cut") || category.includes("shred") || category.includes("lean")) {
    return {
      gradient: "from-orange-500/30 via-red-500/20 to-rose-600/25",
      glow: "shadow-[0_0_40px_-12px_rgba(249,115,22,0.35)]",
      ring: "border-orange-500/20",
      tag: "FAT LOSS",
      accentColor: "#f97316"
    };
  }

  if (category.includes("muscle") || category.includes("mass") || category.includes("strength") || category.includes("bulk")) {
    return {
      gradient: "from-cyan-500/32 via-indigo-500/22 to-violet-600/28",
      glow: "shadow-[0_0_44px_-12px_rgba(99,102,241,0.38)]",
      ring: "border-indigo-400/20",
      tag: "MUSCLE",
      accentColor: "#6366f1"
    };
  }

  if (isHome) {
    return {
      gradient: "from-emerald-500/28 via-teal-500/18 to-cyan-500/24",
      glow: "shadow-[0_0_40px_-12px_rgba(16,185,129,0.32)]",
      ring: "border-emerald-400/20",
      tag: "HOME",
      accentColor: "#10b981"
    };
  }

  if (category.includes("nutrition") || category.includes("diet") || category.includes("keto") || category.includes("gut")) {
    return {
      gradient: "from-teal-500/30 via-cyan-500/20 to-sky-500/25",
      glow: "shadow-[0_0_40px_-12px_rgba(20,184,166,0.32)]",
      ring: "border-teal-400/20",
      tag: "NUTRITION",
      accentColor: "#14b8a6"
    };
  }

  // Default: performance / general
  return {
    gradient: "from-violet-500/28 via-indigo-500/20 to-cyan-500/24",
    glow: "shadow-[0_0_44px_-12px_rgba(167,139,250,0.30)]",
    ring: "border-violet-400/15",
    tag: "PERFORMANCE",
    accentColor: "#a78bfa"
  };
}

export function getProgramTier(program: Pick<Program, "slug">): string {
  const slug = program.slug.toLowerCase();
  if (slug.includes("advanced") || slug.includes("hardcore") || slug.includes("athlete")) return "Elite";
  if (slug.includes("shred") || slug.includes("bulk") || slug.includes("cut")) return "Popular";
  if (slug.includes("starter") || slug.includes("beginner")) return "New";
  return "Signature";
}
