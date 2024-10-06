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
        "background-dark": "#1A1B1E",
        "track-orange": "#FF6B00",
        "track-purple": "#7000FF",
        "track-pink": "#FF00D6",
        "text-light": "#FFFFFF",
        "text-secondary": "#909296",
        "button-primary": "#FF6B00",
      },
    },
  },
  plugins: [],
};

export default config;
