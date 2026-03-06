// ===========================================================
// FILE: mobile/tailwind.config.js
// ===========================================================
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        secondary: {
          50: '#fdf2f8',
          500: '#ec4899',
          600: '#db2777',
        },
      },
    },
  },
  plugins: [],
};