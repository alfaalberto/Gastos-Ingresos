import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Premium financial palette
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b6cdff",
          300: "#85a8ff",
          400: "#577eff",
          500: "#3258f5",
          600: "#213ed1",
          700: "#1a31a3",
          800: "#162a82",
          900: "#0b1f5e",
          950: "#06133d",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dde2ea",
          300: "#bcc4d2",
          400: "#8e98ab",
          500: "#646e83",
          600: "#4a5468",
          700: "#363d4d",
          800: "#1f2532",
          900: "#121620",
          950: "#0a0d14",
        },
        success: {
          DEFAULT: "#10b981",
          soft: "#d1fae5",
          dark: "#065f46",
        },
        danger: {
          DEFAULT: "#ef4444",
          soft: "#fee2e2",
          dark: "#7f1d1d",
        },
        warn: {
          DEFAULT: "#f59e0b",
          soft: "#fef3c7",
          dark: "#78350f",
        },
        gold: {
          DEFAULT: "#c9a24a",
          soft: "#f6ecd3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 6px 24px rgba(0,0,0,0.4)",
        ring: "0 0 0 4px rgba(50,88,245,0.18)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 240ms ease-out",
        "scale-in": "scale-in 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
