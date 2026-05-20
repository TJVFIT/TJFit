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
    // Fat loss: red-tier (warm urgency, but on-brand red instead of orange)
    return {
      gradient: "from-red-500/28 via-rose-500/20 to-cyan-500/22",
      glow: "shadow-[0_0_40px_-12px_rgba(239,68,68,0.32)]",
      ring: "border-red-400/22",
      tag: "FAT LOSS",
      accentColor: "#ef4444"
    };
  }

  if (category.includes("muscle") || category.includes("mass") || category.includes("strength") || category.includes("bulk")) {
    return {
      gradient: "from-cyan-500/32 via-sky-500/22 to-blue-600/28",
      glow: "shadow-[0_0_44px_-12px_rgba(34,211,238,0.38)]",
      ring: "border-cyan-400/22",
      tag: "MUSCLE",
      accentColor: "#22D3EE"
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
    gradient: "from-sky-500/28 via-blue-500/20 to-cyan-500/24",
    glow: "shadow-[0_0_44px_-12px_rgba(14,165,233,0.30)]",
    ring: "border-sky-400/15",
    tag: "PERFORMANCE",
    accentColor: "#0EA5E9"
  };
}

export function getProgramTier(program: Pick<Program, "slug">): string {
  const slug = program.slug.toLowerCase();
  if (slug.includes("advanced") || slug.includes("hardcore") || slug.includes("athlete")) return "Elite";
  if (slug.includes("shred") || slug.includes("bulk") || slug.includes("cut")) return "Popular";
  if (slug.includes("starter") || slug.includes("beginner")) return "New";
  return "Signature";
}
