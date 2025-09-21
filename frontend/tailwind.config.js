/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        borderColor: '#e0e0e0',
        primary: '#071829ff',
      },
    },
  },
  corePlugins: {
    preflight: false,   // ⛔ disables global reset
    //hugmk
  },
  plugins: [],
}
