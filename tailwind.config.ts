import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--app-background)",
        foreground: "var(--app-foreground)",
        "foreground-muted": "var(--app-foreground-muted)",
        accent: "var(--app-accent)",
        "accent-hover": "var(--app-accent-hover)",
        "accent-light": "var(--app-accent-light)",
        gray: "var(--app-gray)",
        "gray-dark": "var(--app-gray-dark)",
        "card-bg": "var(--app-card-bg)",
        "card-border": "var(--app-card-border)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
