/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface-default)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          lowest: "var(--surface-lowest)",
          low: "var(--surface-low)",
          container: "var(--surface-container)",
          high: "var(--surface-high)",
          highest: "var(--surface-highest)",
          border: "var(--surface-border)",
        },
        accent: {
          indigo: "#6366f1",
        },
        on: {
          surface: "var(--on-surface)",
          variant: "var(--on-variant)",
          heading: "var(--on-heading)",
        },
        calm: "#B2D5FF",
        greed: "#F59E0B",
        fear: "#EF4444",
        discipline: "#10B981",
        glass: {
          bg: "rgba(255, 255, 255, 0.03)",
        },
        primary: "#c0c1ff",
        secondary: "#d0bcff",
        tertiary: "#ffb783",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["Courier Prime", "Courier", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
    },
  },
  plugins: [],
};
