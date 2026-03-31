import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: {
          DEFAULT: "#111215",
          elevated: "#15171A"
        },
        accent: "#22D3EE",
        "accent-muted": "#67E8F9",
        success: "#22C55E",
        text: "#F4F4F5"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.45)",
        "lux-glow": "0 0 60px -12px rgba(34, 211, 238, 0.35)",
        "lux-violet": "0 0 50px -14px rgba(167, 139, 250, 0.3)"
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
