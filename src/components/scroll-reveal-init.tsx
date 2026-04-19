"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Mount once in SiteShell — wires `.reveal-section` → `.revealed` */
export function ScrollRevealInit() {
  useScrollReveal();
  return null;
}
