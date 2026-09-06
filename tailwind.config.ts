import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        card: "#18181B",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6",
        },
        success: "#22C55E",
        danger: "#EF4444",
        accent: "#A855F7",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        app: "14px",
      },
      boxShadow: {
        purple: "0 10px 40px rgba(124, 58, 237, 0.25)",
        "purple-sm": "0 4px 20px rgba(124, 58, 237, 0.15)",
        glow: "0 0 25px rgba(168, 85, 247, 0.35)",
      },
      fontFamily: {
        sans: ['Inter', '"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
