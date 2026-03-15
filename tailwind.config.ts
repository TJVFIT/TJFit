import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        surface: "#1A1A1A",
        accent: "#3B82F6",
        success: "#22C55E",
        text: "#F5F5F5"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top, rgba(59,130,246,0.24), transparent 40%), radial-gradient(circle at bottom right, rgba(34,197,94,0.16), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
