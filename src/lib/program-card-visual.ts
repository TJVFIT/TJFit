import type { Program } from "@/lib/content";

export type ProgramVisual = {
  gradient: string;
  glow: string;
  ring: string;
  tag: string;
};

/** Category-driven hero gradient — cool palette only (cyan / violet / teal), no warm tones */
export function getProgramVisual(program: Pick<Program, "category">): ProgramVisual {
  const category = program.category.toLowerCase();
  if (category.includes("nutrition")) {
    return {
      gradient: "from-cyan-500/30 via-teal-500/20 to-sky-500/25",
      glow: "shadow-[0_0_40px_-12px_rgba(34,211,238,0.32)]",
      ring: "border-cyan-400/15",
      tag: "NUTRITION"
    };
  }
  if (category.includes("fat")) {
    return {
      gradient: "from-cyan-500/28 via-sky-500/18 to-violet-500/26",
      glow: "shadow-[0_0_40px_-12px_rgba(34,211,238,0.28)]",
      ring: "border-cyan-400/15",
      tag: "FAT LOSS"
    };
  }
  if (category.includes("muscle") || category.includes("mass")) {
    return {
      gradient: "from-violet-500/32 via-indigo-500/22 to-cyan-500/24",
      glow: "shadow-[0_0_44px_-12px_rgba(167,139,250,0.35)]",
      ring: "border-violet-400/15",
      tag: "MUSCLE"
    };
  }
  return {
    gradient: "from-cyan-500/32 via-sky-500/18 to-indigo-500/28",
    glow: "shadow-[0_0_44px_-12px_rgba(34,211,238,0.28)]",
    ring: "border-cyan-400/15",
    tag: "PERFORMANCE"
  };
}

export function getProgramTier(program: Pick<Program, "slug">): string {
  const slug = program.slug.toLowerCase();
  if (slug.includes("advanced") || slug.includes("hardcore")) return "Elite";
  if (slug.includes("pro") || slug.includes("shred")) return "Popular";
  if (slug.includes("starter") || slug.includes("beginner")) return "New";
  return "Signature";
}
