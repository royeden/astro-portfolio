const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          "0%": {
            "background-position-y": "-100%",
          },
          "100%": {
            "background-position-y": "100%",
          },
        },
      },
      animation: {
        gradient: "gradient 7s linear infinite",
      },
      fontFamily: {
        sans: ['"InterVariable"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("./tailwind-scrollbar.cjs"),
  ],
};
