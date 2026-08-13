"use client";

import { type CSSProperties, type ReactNode } from "react";
import { TJ_PALETTE } from "./palette";

/** Obsidian glass panel with hairline border and warm radial glow. */
export function ObsidianPanel({
  children,
  className,
  glow = "accent",
  style
}: {
  children: ReactNode;
  className?: string;
  glow?: "accent" | "lavender" | "none";
  style?: CSSProperties;
}) {
  const glowStyle: CSSProperties = {};
  if (glow === "accent") {
    glowStyle.background = `radial-gradient(circle at 85% 0%, rgba(168,85,247,0.14), transparent 55%), ${TJ_PALETTE.obsidianGlass}`;
  } else if (glow === "lavender") {
    // rgba below is TJ_PALETTE.mutedLavender (#a99bc8) — the previous value
    // rgba(143,164,196,…) was a genuine cyan-era steel-blue leftover, the
    // only non-violet VALUE found in the 3d system (WP-DESIGN-02).
    glowStyle.background = `radial-gradient(circle at 15% 100%, rgba(169,155,200,0.12), transparent 55%), ${TJ_PALETTE.obsidianGlass}`;
  } else {
    glowStyle.background = TJ_PALETTE.obsidianGlass;
  }
  return (
    <div
      className={
        "relative overflow-hidden rounded-[22px] border backdrop-blur-xl " + (className ?? "")
      }
      style={{
        borderColor: TJ_PALETTE.hairline,
        boxShadow: "0 24px 80px -32px rgba(0,0,0,0.85), inset 0 1px 0 rgba(246,243,237,0.04)",
        ...glowStyle,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Hairline rule — editorial separator. */
export function Hairline({ className }: { className?: string }) {
  return (
    <div
      className={className ?? "h-px w-full"}
      style={{ background: `linear-gradient(90deg, transparent, ${TJ_PALETTE.hairlineStrong}, transparent)` }}
    />
  );
}

/** Accent-inked eyebrow label. */
export function TJEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={"inline-block text-[11px] font-medium uppercase tracking-[0.32em] " + (className ?? "")}
      style={{ color: TJ_PALETTE.accent }}
    >
      {children}
    </span>
  );
}
