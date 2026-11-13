/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B5E2F",
          dark: "#134522",
          light: "#2A7A43",
          50: "#EEF5F0",
          100: "#DCEBE0",
        },
        forest: {
          DEFAULT: "#0D2A17",
          light: "#16391F",
        },
        navy: {
          DEFAULT: "#0A1628",
          light: "#14233C",
        },
        surface: "#F3F6F3",
        line: "#E2E8E3",
        ink: {
          DEFAULT: "#14201A",
          soft: "#3E4C44",
          muted: "#5F6C64",
        },
        success: "#1B5E2F",
        danger: {
          DEFAULT: "#B42318",
          50: "#FDECEA",
        },
        nivel: {
          inicial: "#1D5FD0",
          "inicial-bg": "#E8F0FD",
          intermedio: "#B54708",
          "intermedio-bg": "#FFF1E3",
          avanzado: "#1B5E2F",
          "avanzado-bg": "#E3F1E7",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 20, 0.04)",
        modal: "0 24px 48px -12px rgba(10, 22, 16, 0.35)",
      },
    },
  },
  plugins: [],
};
