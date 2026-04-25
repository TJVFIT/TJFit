/**
 * Material presets for the TJFit v2 3D system.
 * Each preset returns constructor args for <meshStandardMaterial> or <meshPhysicalMaterial>.
 */

import { TJ_PALETTE } from "./palette";

export const TJ_MATERIAL = {
  liquidCyan: {
    color: TJ_PALETTE.accent,
    emissive: TJ_PALETTE.accentLo,
    emissiveIntensity: 0.18,
    metalness: 1,
    roughness: 0.08
  },
  brushedAccent: {
    color: TJ_PALETTE.accentHi,
    emissive: TJ_PALETTE.accentDeep,
    emissiveIntensity: 0.06,
    metalness: 0.92,
    roughness: 0.34
  },
  polishedObsidian: {
    color: TJ_PALETTE.obsidian,
    emissive: "#141418",
    emissiveIntensity: 0.25,
    metalness: 0.7,
    roughness: 0.12
  },
  onyxGlass: {
    color: "#0f0f14",
    emissive: "#2a1f14",
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.05,
    transparent: true,
    opacity: 0.78
  },
  moonlightChrome: {
    color: TJ_PALETTE.moonlight,
    emissive: TJ_PALETTE.frostIce,
    emissiveIntensity: 0.08,
    metalness: 1,
    roughness: 0.18
  },
  coreAccent: {
    color: TJ_PALETTE.accentSoft,
    emissive: TJ_PALETTE.accent,
    emissiveIntensity: 0.85,
    metalness: 0.3,
    roughness: 0.15
  }
} as const;

export type TJMaterialKey = keyof typeof TJ_MATERIAL;
