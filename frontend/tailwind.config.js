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
    },
  },
  plugins: [],
};
