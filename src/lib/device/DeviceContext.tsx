"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  DEFAULT_CAPABILITIES,
  detectDeviceCapabilities,
  type DeviceCapabilities,
  type DeviceTier
} from "@/lib/device/tier";

const SESSION_KEY = "tjfit-device-caps";

const DeviceContext = createContext<DeviceCapabilities>(DEFAULT_CAPABILITIES);

function readCached(): DeviceCapabilities | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeviceCapabilities;
    if (typeof parsed?.tier !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistCache(caps: DeviceCapabilities): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(caps));
  } catch {
    /* sessionStorage may be disabled (Safari private mode); fail silently */
  }
}

// Wrap the app once. Detection is sync-on-mount and the result is
// cached in sessionStorage so subsequent navigations reuse the tier
// without re-running matchMedia checks.
export function DeviceProvider({ children }: { children: ReactNode }) {
  const [caps, setCaps] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);

  useEffect(() => {
    const cached = readCached();
    if (cached) {
      setCaps(cached);
      return;
    }
    const detected = detectDeviceCapabilities();
    setCaps(detected);
    persistCache(detected);
  }, []);

  // Listen for live changes to the OS-level reduced-motion / reduced-
  // transparency preferences. If the user toggles those mid-session
  // we re-render with the new value rather than waiting for the next
  // navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const transparencyMq = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const update = () => {
      setCaps((prev) => ({
        ...prev,
        prefersReducedMotion: motionMq.matches,
        prefersReducedTransparency: transparencyMq.matches
      }));
    };
    motionMq.addEventListener("change", update);
    transparencyMq.addEventListener("change", update);
    return () => {
      motionMq.removeEventListener("change", update);
      transparencyMq.removeEventListener("change", update);
    };
  }, []);

  return <DeviceContext.Provider value={caps}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceCapabilities {
  return useContext(DeviceContext);
}

export function useTier(): DeviceTier {
  return useContext(DeviceContext).tier;
}

// Convenience: returns true when the consumer should render its
// fully-animated form. Skips on reduced-motion AND on Low tier.
export function useShouldAnimate(): boolean {
  const caps = useContext(DeviceContext);
  return !caps.prefersReducedMotion && caps.tier !== "low";
}
