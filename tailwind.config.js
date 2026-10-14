/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#4F0B17',
        olive: '#7A1626',
        gold: '#D4AF37',
        ivory: '#F8EFDD',
      },
      fontFamily: {
        primary: ['var(--font-primary)', 'sans-serif'],
        sans: ['var(--font-primary)', 'sans-serif'],
        serif: ['var(--font-primary)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
