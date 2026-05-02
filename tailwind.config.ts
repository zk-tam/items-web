import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        items: {
          blue: "var(--items-blue)",
          blueHover: "var(--items-blue-hover)",
          white: "#FFFFFF",
          dim: "var(--items-dim)",
          placeholder: "var(--items-placeholder)",
          lineSoft: "var(--items-line-soft)"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-avenir)",
          "Avenir",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      borderRadius: {
        item: "20px",
        itemLg: "28px",
        button: "8px"
      },
      maxWidth: {
        items: "1280px"
      },
      spacing: {
        sidebar: "280px"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
