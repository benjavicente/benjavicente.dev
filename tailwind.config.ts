import type { Config } from "tailwindcss";

// color: #f8fcfc;
// color: #f1f9f8;
// color: #e1eeef;
// color: #94b5b8;
// color: #94b5b8;
// color: #65888b;
// color: #48676a;
// color: #345356;
// color: #1d363a;
// color: #0f2429;
// color: #021217;

const config: Config = {
  content: ["./public/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
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
  plugins: [],
};

export default config;
