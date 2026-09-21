import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12161C",
          soft: "#3A4150",
        },
        paper: "#FAFAF9",
        surface: "#FFFFFF",
        line: "#E4E6EA",
        signal: {
          DEFAULT: "#2451B3",
          dark: "#1B3D8F",
          light: "#EEF2FC",
        },
        score: {
          good: "#1A7F5A",
          goodBg: "#EAF6F0",
          warn: "#B7791F",
          warnBg: "#FBF3E4",
          bad: "#C0392B",
          badBg: "#FBEAE8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1180px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(18,22,28,0.04), 0 8px 24px rgba(18,22,28,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
