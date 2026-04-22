/**
 * TJFit v2 visual palette — SCARABUSE-tier obsidian + champagne gold.
 * Shared by 3D scenes, card treatments, and surface re-skins.
 */

export const TJ_PALETTE = {
  // Backgrounds — deep obsidian with warm undertone
  obsidian: "#08080a",
  obsidianRaised: "#0d0d10",
  obsidianGlass: "rgba(14, 14, 18, 0.72)",

  // Gold / champagne — primary accent family
  champagne: "#d4a574",
  champagneHi: "#e8c79c",
  champagneLo: "#a07246",
  roseGold: "#f0b89a",
  antiqueBronze: "#7a5432",

  // Cool accents — used sparingly for depth contrast
  moonlight: "#c8d4e8",
  frostIce: "#8fa4c4",

  // Text
  textPrimary: "#f6f3ed",
  textMuted: "#a19284",
  textSubtle: "rgba(246, 243, 237, 0.52)",

  // Lines & borders
  hairline: "rgba(246, 243, 237, 0.09)",
  hairlineStrong: "rgba(246, 243, 237, 0.16)",

  // States
  accentWarn: "#d97757",
  accentSuccess: "#9bb872"
} as const;

export type TJPalette = typeof TJ_PALETTE;

/** Three.js-friendly hex ints for lights. */
export const TJ_LIGHTS = {
  keyChampagne: 0xf5d4a0,
  fillMoonlight: 0x87a4d4,
  rimGold: 0xd4a574,
  ambient: 0xffffff
} as const;
