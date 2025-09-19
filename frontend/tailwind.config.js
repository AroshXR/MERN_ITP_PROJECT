/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom border color here
        borderColor: '#e0e0e0',  // Replace with your desired color value
        primary: '#071829ff',
      },
    },
  },
  plugins: [],
}
