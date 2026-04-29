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
          2: "#0E0F12"
        },
        divider: "#1E2028",
        muted: "#A1A1AA",
        dim: "#52525B",
        faint: "#71717A",
        bright: "#D4D4D8",
        accent: "#22D3EE",
        "accent-muted": "#67E8F9",
        "accent-sky": "#0EA5E9",
        "accent-violet": "#94A3B8",
        success: "#22C55E",
        danger: "#EF4444",
        text: "#FFFFFF"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Sora", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.45)",
        "lux-glow": "0 0 60px -12px rgba(34, 211, 238, 0.35)",
        "lux-violet": "0 18px 50px -24px rgba(148, 163, 184, 0.24)",
        "premium-card": "0 12px 40px -16px rgba(0,0,0,0.5)"
      },
      backgroundImage: {
        /** Cool hero wash — cyan + sky (brand-only) */
        "hero-gradient":
          "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.14), transparent 42%), radial-gradient(circle at 100% 40%, rgba(14,165,233,0.08), transparent 38%)"
      }
    }
  },
  plugins: []
};

export default config;
