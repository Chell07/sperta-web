/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'],
          raleway: ['Raleway', 'sans-serif'],
          playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        border: "hsl(var(--border))",
      },
      borderRadius: {
        full: "var(--radius)",
      }
    },
  },
  plugins: [],
}
