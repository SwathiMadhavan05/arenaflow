/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Didact Gothic', 'sans-serif'],
        mono: ['Didact Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
