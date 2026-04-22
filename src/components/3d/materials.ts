/**
 * Material presets for the TJFit v2 3D system.
 * Each preset returns constructor args for <meshStandardMaterial> or <meshPhysicalMaterial>.
 */

import { TJ_PALETTE } from "./palette";

export const TJ_MATERIAL = {
  liquidGold: {
    color: TJ_PALETTE.champagne,
    emissive: TJ_PALETTE.champagneLo,
    emissiveIntensity: 0.18,
    metalness: 1,
    roughness: 0.08
  },
  brushedChampagne: {
    color: TJ_PALETTE.champagneHi,
    emissive: TJ_PALETTE.antiqueBronze,
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
  emberCore: {
    color: TJ_PALETTE.roseGold,
    emissive: TJ_PALETTE.champagne,
    emissiveIntensity: 0.85,
    metalness: 0.3,
    roughness: 0.15
  }
} as const;

export type TJMaterialKey = keyof typeof TJ_MATERIAL;
