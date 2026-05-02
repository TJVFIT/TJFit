// Device capability detection (master upgrade prompt v3, Phase 1).
//
// The whole "living organism" effect chain depends on knowing what
// device we're on. Lower-tier devices get static fallbacks; higher
// tiers get the full ambient mechanics. Without this foundation,
// every subsequent effect would have to ship its own branching.
//
// We deliberately avoid the `detect-gpu` package suggested in the v3
// prompt — it adds ~120 KB to the client bundle and probes WebGL
// synchronously on first paint. Instead we infer from broadly-
// available signals:
//   - navigator.hardwareConcurrency  (CPU core count)
//   - navigator.deviceMemory         (RAM hint, when exposed)
//   - matchMedia('(hover: none)')    (touch device proxy)
//   - navigator.connection           (saveData / effective type)
//   - prefers-reduced-motion / -transparency
//   - DeviceOrientationEvent / vibrate availability
//
// If a future round wants WebGL-tier accuracy, drop in detect-gpu and
// override `tier` here — every consumer reads the union type so the
// substitution is transparent.

export type DeviceTier = "low" | "mid" | "high" | "ultra";

export type ConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "5g" | "unknown";

export type DeviceCapabilities = {
  /** Auto-detected tier — `low` is the safe default before detection runs. */
  tier: DeviceTier;
  /** True on touch-primary devices. */
  isTouch: boolean;
  /** True when touch + (hover: none). Distinct from `isTouch`: a Surface laptop is touch but has hover. */
  isMobile: boolean;
  /** OS / browser preference for reduced motion. */
  prefersReducedMotion: boolean;
  /** OS / browser preference for reduced transparency. */
  prefersReducedTransparency: boolean;
  /** CPU cores reported by `navigator.hardwareConcurrency`. */
  cpuCores: number;
  /** RAM hint from `navigator.deviceMemory` (GB). Many browsers don't expose; fallback 4. */
  deviceMemoryGB: number;
  /** True when DeviceOrientationEvent is constructable. iOS 13+ requires permission separately. */
  hasGyroscope: boolean;
  /** True when navigator.vibrate exists. Not all browsers fire it (Safari ignores). */
  hasHaptics: boolean;
  /** Audio context allowed — false until first user gesture per browser autoplay policy. */
  audioAllowed: boolean;
  /** User's data-saver preference. */
  saveData: boolean;
  /** Effective connection type from Network Information API. */
  connectionType: ConnectionType;
};

// Conservative SSR / first-paint default — anything we render on the
// server should assume the lowest tier so we don't ship effects that
// flicker off after hydration.
export const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  tier: "low",
  isTouch: false,
  isMobile: false,
  prefersReducedMotion: false,
  prefersReducedTransparency: false,
  cpuCores: 4,
  deviceMemoryGB: 4,
  hasGyroscope: false,
  hasHaptics: false,
  audioAllowed: false,
  saveData: false,
  connectionType: "unknown"
};

type ExperimentalNavigator = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: ConnectionType;
  };
};

function readConnection(nav: ExperimentalNavigator): { saveData: boolean; type: ConnectionType } {
  const c = nav.connection;
  return {
    saveData: Boolean(c?.saveData),
    type: (c?.effectiveType as ConnectionType | undefined) ?? "unknown"
  };
}

// Heuristic tier mapper. Reads the cheapest signals first; bumps up
// when CPU + memory + connection all clear; clamps down on saveData
// or a reduced-motion preference.
export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") return DEFAULT_CAPABILITIES;

  const nav = navigator as ExperimentalNavigator;

  const isTouch = "ontouchstart" in window || nav.maxTouchPoints > 0;
  const noHover = window.matchMedia("(hover: none)").matches;
  const isMobile = isTouch && noHover;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;

  const cpuCores = nav.hardwareConcurrency ?? 4;
  const deviceMemoryGB = nav.deviceMemory ?? 4;
  const hasGyroscope = typeof DeviceOrientationEvent !== "undefined";
  const hasHaptics = typeof nav.vibrate === "function";
  const conn = readConnection(nav);

  // Tier resolution. Order matters — saveData and slow connection
  // dominate everything (a high-end phone on a 2G hotel network gets
  // the low-tier experience).
  let tier: DeviceTier;
  if (conn.saveData || conn.type === "slow-2g" || conn.type === "2g") {
    tier = "low";
  } else if (prefersReducedMotion) {
    // Reduced motion isn't a tier — it's a separate gate the consumer
    // checks. But it's a strong hint that the user doesn't want
    // ambient effects, so we cap at mid.
    tier = "mid";
  } else if (cpuCores >= 8 && deviceMemoryGB >= 8 && !isMobile) {
    tier = "ultra";
  } else if (cpuCores >= 6 && deviceMemoryGB >= 4) {
    tier = isMobile ? "high" : "high";
  } else if (cpuCores >= 4) {
    tier = "mid";
  } else {
    tier = "low";
  }

  return {
    tier,
    isTouch,
    isMobile,
    prefersReducedMotion,
    prefersReducedTransparency,
    cpuCores,
    deviceMemoryGB,
    hasGyroscope,
    hasHaptics,
    audioAllowed: false,
    saveData: conn.saveData,
    connectionType: conn.type
  };
}

// Manual override applied after detection — lets the user force
// "Reduce visual effects" to ON in settings regardless of detected
// tier. The override is stored per-user-profile in DB elsewhere; this
// function takes the raw capabilities + override and returns the
// effective tier consumers should read.
export function applyTierOverride(
  caps: DeviceCapabilities,
  override: "auto" | "low" | "mid" | "high" | "ultra"
): DeviceCapabilities {
  if (override === "auto") return caps;
  return { ...caps, tier: override };
}

// Boolean helpers so consumers don't have to write tier comparisons
// inline. Order is `low < mid < high < ultra`.
const TIER_ORDER: Record<DeviceTier, number> = { low: 0, mid: 1, high: 2, ultra: 3 };

export function tierAtLeast(caps: DeviceCapabilities, threshold: DeviceTier): boolean {
  return TIER_ORDER[caps.tier] >= TIER_ORDER[threshold];
}
