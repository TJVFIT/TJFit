import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
        "accent-violet": "#A78BFA",
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
        "lux-violet": "0 0 50px -14px rgba(167, 139, 250, 0.3)",
        "premium-card": "0 12px 40px -16px rgba(0,0,0,0.5)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.18), transparent 42%), radial-gradient(circle at 100% 40%, rgba(167,139,250,0.14), transparent 38%)"
      }
    }
  },
  plugins: []
};

export default config;
