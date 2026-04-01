/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0a0a0f",
          1: "#12121a",
          2: "#1a1a26",
          3: "#242433",
          4: "#2e2e40",
        },
        accent: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          dim: "#4f46e5",
        },
        mint: "#34d399",
        coral: "#fb7185",
        text: {
          primary: "#f0f0f5",
          secondary: "#a1a1b5",
          muted: "#6b6b80",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "0.85rem" }],
      },
      keyframes: {
        "ambient-drift-1": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(3%, -2%) scale(1.08)" },
          "66%": { transform: "translate(-2%, 3%) scale(0.94)" },
        },
        "ambient-drift-2": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "40%": { transform: "translate(-4%, 2%) scale(1.06)" },
          "75%": { transform: "translate(2%, -3%) scale(0.96)" },
        },
        "ambient-drift-3": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(2%, 4%) scale(1.04)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "step-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.88)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(18px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(18px) rotate(-360deg)" },
        },
        "orbit-reverse": {
          "0%": { transform: "rotate(0deg) translateX(10px) rotate(0deg)" },
          "100%": { transform: "rotate(-360deg) translateX(10px) rotate(360deg)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "ambient-1": "ambient-drift-1 22s ease-in-out infinite",
        "ambient-2": "ambient-drift-2 28s ease-in-out infinite",
        "ambient-3": "ambient-drift-3 18s ease-in-out infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "step-pulse": "step-pulse 1.4s ease-in-out infinite",
        "shimmer": "shimmer 2.4s linear infinite",
        "orbit": "orbit 2s linear infinite",
        "orbit-reverse": "orbit-reverse 1.4s linear infinite",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-accent-md": "0 0 40px rgba(99, 102, 241, 0.12)",
        "glass": "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
        "glass-lg": "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.15)",
      },
    },
  },
  plugins: [],
};
