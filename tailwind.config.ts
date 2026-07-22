import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0F0E17",
          surface: "#171522",
          surface2: "#1D1A2B",
          line: "#2C2840",
          text: "#F2F0FF",
          muted: "#8B87A1",
        },
        violet: {
          DEFAULT: "#7C5CFC",
          dim: "#5A41C9",
          glow: "#A78BFA",
        },
        coral: "#FF6B6B",
        teal: "#2DD4BF",
        sand: "#F4C97A",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        hand: ["var(--font-caveat)", "cursive"],
      },
      backgroundImage: {
        grid: "radial-gradient(circle, #2C2840 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "22px 22px",
      },
    },
  },
  plugins: [],
};

export default config;
