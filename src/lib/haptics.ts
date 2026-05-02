// Haptics helper (master upgrade prompt v3, Phase 4.2).
//
// Wraps `navigator.vibrate()` with named patterns + a user-pref
// override stored in localStorage. Fails silently when:
//   - the API isn't supported (Safari ignores `navigator.vibrate`)
//   - the user has disabled haptics in settings
//   - the call isn't tied to a user gesture (browser will reject)
//
// All four patterns map to MDN-documented vibration arrays. The
// `tap` and `warn` patterns are cribbed from the BoxTime fitness-
// timer review threads (well-tested for distinguishability while
// training).
//
// Example:
//   import { haptic } from "@/lib/haptics";
//   onClick={() => haptic("tap")}        // set complete
//   onTimerEnd={() => haptic("impact")}  // rest done

export type HapticPattern = "tap" | "warn" | "impact" | "celebrate";
export type HapticPreference = "on" | "minimal" | "off";

const STORAGE_KEY = "tjfit-haptics";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  // Single quick buzz — set completion, button confirmation, water sip
  tap: 30,
  // Triple-tap — rest timer 10s warning. Distinct from `tap` even
  // through a sleeve.
  warn: [50, 50, 50],
  // Single longer pulse — rest timer end, set incomplete alert
  impact: 200,
  // Celebration cluster — workout complete, milestone unlock
  celebrate: [100, 50, 100, 50, 200]
};

// Minimal mode collapses everything to a single short tap so the
// user knows something happened without the celebration drama.
const MINIMAL_PATTERN: number = 30;

function readPreference(): HapticPreference {
  if (typeof window === "undefined") return "on";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "on" || raw === "minimal" || raw === "off") return raw;
  } catch {
    /* localStorage disabled — default to on */
  }
  return "on";
}

export function setHapticPreference(value: HapticPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent("tjfit:haptic-preference-changed", { detail: value })
    );
  } catch {
    /* fail silently */
  }
}

export function getHapticPreference(): HapticPreference {
  return readPreference();
}

export function isHapticSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function haptic(pattern: HapticPattern, override?: HapticPreference): boolean {
  if (!isHapticSupported()) return false;
  const preference = override ?? readPreference();
  if (preference === "off") return false;

  const value = preference === "minimal" ? MINIMAL_PATTERN : PATTERNS[pattern];

  try {
    return navigator.vibrate(value);
  } catch {
    // Some browsers throw when called outside a user-gesture handler.
    return false;
  }
}
