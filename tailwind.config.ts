import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f6fbf2",
          100: "#e5f2da",
          200: "#cfe5bd",
          500: "#6a9b4c",
          700: "#3f6b2d",
          900: "#23421c"
        },
        soil: "#675846",
        cream: "#fffaf0",
        linen: "#f8f1e4",
        sun: "#f8d56b"
      }
    }
  },
  plugins: []
};

export default config;
