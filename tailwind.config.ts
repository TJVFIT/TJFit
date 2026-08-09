import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      /** Editorial motion curves — pair with duration-* utilities */
      transitionTimingFunction: {
        /** Primary UI easing — confident stop, minimal overshoot */
        premium: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        /** Playful entrances — subtle overshoot */
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        /** Soft landings — fast out, gentle settle */
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      /** Canonical duration scale — use with motion-reduce-safe components */
      transitionDuration: {
        120: "120ms",
        180: "180ms",
        240: "240ms",
        280: "280ms",
        320: "320ms",
        480: "480ms",
        720: "720ms",
        1000: "1000ms"
      },
      keyframes: {
        /** Opacity + rise — hero lines, editorial blocks */
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        /** Opacity + scale — modals, popovers */
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        /** Opacity + blur resolve — cinematic text reveals */
        blurIn: {
          "0%": { opacity: "0", filter: "blur(10px)" },
          "100%": { opacity: "1", filter: "blur(0)" }
        },
        /** Edge sheen — skeletons, chrome highlights */
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        /** Ambient halo — badges, orbital accents */
        breathe: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" }
        },
        /** Background parallax garnish — meshes, grids */
        drift: {
          "0%,100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-12px) translateX(4px)" }
        }
      },
      animation: {
        "fade-up": "fadeUp 560ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "scale-in": "scaleIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "blur-in": "blurIn 720ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        shimmer: "shimmer 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        breathe: "breathe 3.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
        drift: "drift 22s ease-in-out infinite"
      },
      borderRadius: {
        /** ~28px — large shells (auth panels, modals, legacy “28px” cards) */
        shell: "1.75rem"
      },
      colors: {
        background: "#0A0A0B",
        surface: {
          DEFAULT: "#111215",
          elevated: "#15171A",
          2: "#0E0F12",
          /** Hover / sticky-bar surface — top of the elevation stack. */
          3: "#1E2126"
        },
        divider: "#1E2028",
        muted: "#A1A1AA",
        dim: "#6B6B76",
        faint: "#71717A",
        bright: "#D4D4D8",
        /** Primary brand accent — electric violet. */
        accent: "#A855F7",
        /** Soft purple — muted accent / hover tints. */
        "accent-muted": "#C4B5FD",
        /** Violet — secondary brand accent (historical name "sky"). */
        "accent-sky": "#7C3AED",
        /** Soft purple — historical name "violet"; kept for back-compat. */
        "accent-violet": "#C4B5FD",
        /** Bright lavender-violet — premium / AI / Apex / TJAI badges. */
        premium: "#C4B5FD",
        success: "#22C55E",
        /** Softer red than the legacy #EF4444 — pairs with the violet accent. */
        danger: "#F87171",
        warning: "#F59E0B",
        text: "#FFFFFF"
      },
      fontFamily: {
        // Self-hosted, see src/app/layout.tsx. Arabic is intentionally not a
        // fallback here — it lacks Turkish glyphs and is scoped to :root[lang="ar"].
        sans: ["var(--font-sans)", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        arabic: ["var(--font-arabic)", "Segoe UI", "Noto Naskh Arabic", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.45)",
        "lux-glow": "0 0 60px -12px rgba(168, 85, 247, 0.35)",
        "lux-violet": "0 18px 50px -24px rgba(124, 58, 237, 0.30)",
        "premium-card": "0 12px 40px -16px rgba(0,0,0,0.5)"
      },
      backgroundImage: {
        /** Premium hero wash — electric violet + violet (brand-only) */
        "hero-gradient":
          "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.16), transparent 42%), radial-gradient(circle at 100% 40%, rgba(124,58,237,0.10), transparent 38%)"
      }
    }
  },
  plugins: []
};

export default config;
