import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#121212",
        coral: "#FF0000",
        dim: "#9a9a9a"
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
