import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FSA Workouts theme - Dark athletic style
        fsa: {
          black: "#0a0a0a",
          darker: "#050505",
          dark: "#111111",
          gray: "#1a1a1a",
          "gray-light": "#2a2a2a",
          red: "#e53935",
          "red-dark": "#c62828",
          "red-light": "#ff6659",
          gold: "#d4a855",
          text: "#ffffff",
          "text-muted": "#9ca3af",
          "text-dim": "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(229, 57, 53, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(229, 57, 53, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
