/** Free catalog slugs only; fat-loss free starter is home-based. */
export function resolveStartFunnelProgramSlug(goal: "fat" | "muscle", _location: "home" | "gym"): string {
  if (goal === "fat") return "home-fat-loss-starter";
  return "gym-muscle-starter";
}

export function resolveStartFunnelDietSlug(diet: "cut" | "bulk"): string {
  return diet === "bulk" ? "lean-bulk-starter" : "clean-cut-starter";
}
