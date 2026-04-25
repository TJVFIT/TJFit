/**
 * TJFit v2 visual palette — obsidian black + brand cyan.
 * Shared by 3D scenes, card treatments, and surface re-skins.
 */

export const TJ_PALETTE = {
  // Backgrounds — deep obsidian
  obsidian: "#08080a",
  obsidianRaised: "#0d0d10",
  obsidianGlass: "rgba(14, 14, 18, 0.72)",

  // Cyan — primary accent family
  accent: "#22D3EE",
  accentHi: "#A5F3FC",
  accentLo: "#0E7490",
  accentSoft: "#67E8F9",
  accentDeep: "#155E75",

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
  keyAccent: 0x22d3ee,
  fillMoonlight: 0x87a4d4,
  rimAccent: 0x22d3ee,
  ambient: 0xffffff
} as const;
