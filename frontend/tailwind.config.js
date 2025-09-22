/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
         borderColor: '#000000',
        primary: '#071829ff',
        light: '#f4f4f9',
        'primary-dull': '#3a5160',
      },
    },
  },
  corePlugins: {
    preflight: false,   // ⛔ disables global reset
  },
  plugins: [],
}
