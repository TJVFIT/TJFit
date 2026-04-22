"use client";

import { type CSSProperties, type ReactNode } from "react";
import { TJ_PALETTE } from "./palette";

/** Obsidian glass panel with hairline border and warm radial glow. */
export function ObsidianPanel({
  children,
  className,
  glow = "champagne",
  style
}: {
  children: ReactNode;
  className?: string;
  glow?: "champagne" | "moonlight" | "none";
  style?: CSSProperties;
}) {
  const glowStyle: CSSProperties = {};
  if (glow === "champagne") {
    glowStyle.background = `radial-gradient(circle at 85% 0%, rgba(212, 165, 116, 0.14), transparent 55%), ${TJ_PALETTE.obsidianGlass}`;
  } else if (glow === "moonlight") {
    glowStyle.background = `radial-gradient(circle at 15% 100%, rgba(143, 164, 196, 0.12), transparent 55%), ${TJ_PALETTE.obsidianGlass}`;
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
        boxShadow: "0 24px 80px -32px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(246, 243, 237, 0.04)",
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

/** Champagne-inked eyebrow label. */
export function TJEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={"inline-block text-[11px] font-medium uppercase tracking-[0.32em] " + (className ?? "")}
      style={{ color: TJ_PALETTE.champagne }}
    >
      {children}
    </span>
  );
}
