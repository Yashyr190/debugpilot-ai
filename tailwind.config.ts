import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080b10",
        panel: "#101620",
        line: "rgba(148, 163, 184, 0.18)"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(20, 184, 166, 0.12)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
