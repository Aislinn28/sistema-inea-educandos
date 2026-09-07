/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A5F",
          dark: "#152A45",
          light: "#2E5488",
        },
        accent: {
          DEFAULT: "#C9A227",
          dark: "#A8871F",
        },
        paper: "#FAFAF7",
        ink: "#33393F",
        success: "#2F6B4F",
        danger: "#B3432D",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
