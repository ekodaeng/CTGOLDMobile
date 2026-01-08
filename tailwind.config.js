/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ctgold-gold': '#D4AF37',
        'ctgold-gold-light': '#F5C542',
        'ctgold-gold-dark': '#B8941E',
      },
      boxShadow: {
        'ctgold-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
      },
    },
  },
  plugins: [],
};
