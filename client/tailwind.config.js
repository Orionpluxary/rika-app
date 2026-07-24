/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        "paper-soft": "#FCFBF9",
        ink: "#1B1B1D",
        "ink-soft": "#4A4850",
        muted: "#9C98A0",
        blush: "#FBE7EB",
        "blush-line": "#E7A9B4",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Zen Maru Gothic'", "'Inter'", "sans-serif"],
      },
      boxShadow: {
        hairline: "0 0 0 1px rgba(27,27,29,0.08)",
      },
      borderRadius: {
        bubble: "1.25rem",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: 0.35, transform: "scale(0.9)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        twinkle: "twinkle 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
