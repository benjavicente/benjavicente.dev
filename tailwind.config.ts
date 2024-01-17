import type { Config } from "tailwindcss";
import prose from "@tailwindcss/typography";
import { colors } from "./src/theme";

const config = {
  content: ["./{public,src}/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors } },
  plugins: [prose],
} satisfies Config;

export default config;
