import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#F8FAFC",
          navyDark: "#080E1A",
          navyLight: "#1E293B",
          blue: "#38BDF8",
          blueLight: "#0C4A6E",
          blueDark: "#0284C7",
        },
        surface: {
          50: "#0B1120",
          100: "#111C30",
          200: "#1E293B",
          300: "#334155",
          card: "#131E32",
        },
        status: {
          success: "#22C55E",
          successBg: "#052E16",
          successText: "#4ADE80",
          warning: "#F59E0B",
          warningBg: "#451A03",
          warningText: "#FBBF24",
          danger: "#EF4444",
          dangerBg: "#450A0A",
          dangerText: "#F87171",
          info: "#38BDF8",
          infoBg: "#082F49",
          infoText: "#7DD3FC",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};

export default config;
