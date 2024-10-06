import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/MantineProvider.tsx",
    "./src/components/AudioEditor.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--mantine-color-orange-6)",
        "primary-hover": "var(--mantine-color-orange-7)",
        "text-light": "var(--mantine-color-white)",
        "text-secondary": "var(--mantine-color-gray-6)",
        "background-dark": "var(--mantine-color-dark-7)",
      },
    },
  },
  plugins: [],
};

export default config;
