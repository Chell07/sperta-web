/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Inter Variable'", "'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "'Inter Variable'", "'Inter'", "ui-sans-serif", "sans-serif"],
        mono:    ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        bg: {
          0: "hsl(var(--bg-0))",
          1: "hsl(var(--bg-1))",
          2: "hsl(var(--bg-2))",
          3: "hsl(var(--bg-3))",
        },
        fg: {
          0: "hsl(var(--fg-0))",
          1: "hsl(var(--fg-1))",
          2: "hsl(var(--fg-2))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          glow:    "hsl(var(--accent) / 0.35)",
        },
        neon: {
          DEFAULT: "hsl(var(--neon))",
          glow:    "hsl(var(--neon) / 0.4)",
        },
        line:   "hsl(var(--line) / 0.6)",
        danger: "hsl(var(--danger))",
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--line) / 0.6), 0 10px 40px -10px hsl(var(--accent) / 0.35)",
        neon: "0 0 24px hsl(var(--neon) / 0.4), inset 0 0 0 1px hsl(var(--neon) / 0.6)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
    },
  },
  plugins: [],
}
