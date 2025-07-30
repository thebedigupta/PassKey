/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['"Bitcount Grid Single"', "system-ui"],
      },
    },
  },
  plugins: [],
};
