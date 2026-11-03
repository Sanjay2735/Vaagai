/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Luxury Palette
        burgundy: {
          DEFAULT: '#4A0715',
          deep: '#35050E',
          royal: '#720F25',
          wine: '#720F25',
          dark: '#2A040C',
        },
        gold: {
          DEFAULT: '#C9A43B',
          antique: '#C9A43B',
          lustrous: '#D4AF37',
          champagne: '#E9D9BF',
          light: '#F4E7C5',
          rich: '#B38B2E',
        },
        champagne: {
          DEFAULT: '#E9D9BF',
          light: '#F5EEE5',
          dark: '#D9C5A5',
        },
        ivory: {
          DEFAULT: '#F5EEE5',
          warm: '#F5EEE5',
          pure: '#FAF7F2',
          light: '#FCF9F5',
        },
        beige: {
          DEFAULT: '#D9C5A5',
          soft: '#D9C5A5',
          warm: '#E2D3BB',
          dark: '#BAA27E',
        },
        charcoal: {
          DEFAULT: '#29201E',
          dark: '#1C1514',
          light: '#3D312E',
          soft: '#4A3D3A',
        },
        brown: {
          muted: '#70594B',
          warm: '#5E483C',
        },

        // Backwards compatibility aliases
        forest: '#4A0715',
        olive: '#720F25',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        display: ['"Italiana"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Jost"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        primary: ['"Jost"', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.25em',
        'couture': '0.35em',
        'widest-plus': '0.4em',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2.5s infinite',
      },
    },
  },
  plugins: [],
};
