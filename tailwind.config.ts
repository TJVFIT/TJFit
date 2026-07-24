import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--text) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"]
      },
      backgroundImage: {
        "hero-depth":
          "radial-gradient(circle at 72% 35%, rgb(var(--accent) / 0.18), transparent 34%), radial-gradient(circle at 18% 80%, rgb(var(--accent-soft) / 0.10), transparent 36%)"
      },
      boxShadow: {
        diffusion: "0 30px 80px -44px rgba(5, 18, 48, 0.9)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.08)"
      },
      animation: {
        "marquee-slow": "marquee 28s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite",
        loaderCircle: "loaderCircle 5s linear infinite",
        loaderLetter: "loaderLetter 3s infinite"
      },
      keyframes: {
        marquee: {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" }
        },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-10px,0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.94)" },
          "50%": { opacity: "1", transform: "scale(1)" }
        },
        loaderLetter: {
          "0%, 100%": { opacity: "0.4", transform: "translateY(0)" },
          "20%": { opacity: "1", transform: "scale(1.15)" },
          "40%": { opacity: "0.7", transform: "translateY(0)" }
        },
        loaderCircle: {
          "0%": {
            transform: "rotate(90deg)",
            boxShadow:
              "0 6px 12px 0 rgb(var(--accent-soft)) inset, 0 12px 18px 0 rgb(var(--accent)) inset, 0 36px 36px 0 #132d72 inset"
          },
          "50%": {
            transform: "rotate(270deg)",
            boxShadow:
              "0 6px 12px 0 #86a9ff inset, 0 12px 6px 0 #386ff0 inset, 0 24px 36px 0 rgb(var(--accent)) inset"
          },
          "100%": {
            transform: "rotate(450deg)",
            boxShadow:
              "0 6px 12px 0 rgb(var(--accent-soft)) inset, 0 12px 18px 0 rgb(var(--accent)) inset, 0 36px 36px 0 #132d72 inset"
          }
        }
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
