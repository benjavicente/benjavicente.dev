import type { Config } from "tailwindcss";
import prose from "@tailwindcss/typography";

const config = {
  content: ["./{public,app}/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f8fcfc",
          100: "#f1f9f8",
          200: "#e1eeef",
          300: "#cbe1e1",
          400: "#94b5b8",
          500: "#65888b",
          600: "#48676a",
          700: "#345356",
          800: "#1d363a",
          900: "#0f2429",
          950: "#021217",
        },
      },
    },
  },
  plugins: [prose],
} satisfies Config;

export default config;
