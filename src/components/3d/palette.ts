/**
 * TJFit visual palette — obsidian black + brand violet.
 * Shared by 3D scenes, card treatments, and surface re-skins.
 */

export const TJ_PALETTE = {
  // Backgrounds — deep obsidian
  obsidian: "#050507",
  obsidianRaised: "#0b0710",
  obsidianGlass: "rgba(18, 12, 28, 0.72)",

  // Violet — primary accent family
  accent: "#A855F7",
  accentHi: "#EDE9FE",
  accentLo: "#6D28D9",
  accentSoft: "#C4B5FD",
  accentDeep: "#4C1D95",

  // Pale lavender accents — used sparingly for depth contrast
  // (renamed from cyan-era names moonlight/frostIce, WP-DESIGN-02; the
  // values were always violet-family)
  paleLavender: "#d6cdec",
  mutedLavender: "#a99bc8",

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
  keyAccent: 0xa855f7,
  fillMoonlight: 0x8b7bb8,
  rimAccent: 0x7c3aed,
  ambient: 0xffffff
} as const;
