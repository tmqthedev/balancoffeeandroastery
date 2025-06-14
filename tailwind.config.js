/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {    extend: {
      colors: {
        // New brand colors
        brand: {
          primary: '#1A3C34',    // Xanh đậm
          secondary: '#FFC107',  // Vàng sáng
          white: '#FFFFFF',      // Trắng
        },
        // Keep coffee colors for compatibility
        coffee: {
          50: '#faf7f2',
          100: '#f4ede2',
          200: '#e8d9c4',
          300: '#d9c09e',
          400: '#c9a577',
          500: '#be925c',
          600: '#b18050',
          700: '#936643',
          800: '#78553a',
          900: '#614530',
          950: '#342318',
        },
        cream: {
          50: '#fefdfb',
          100: '#fefaf5',
          200: '#fcf2e8',
          300: '#f9e8d4',
          400: '#f4d5b7',
          500: '#edbf94',
          600: '#e3a46f',
          700: '#d6824d',
          800: '#b26a3e',
          900: '#8f5735',
          950: '#4e2c1a',
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['Playfair Display', 'ui-serif', 'Georgia'],
      },
      letterSpacing: {
        'wide-light': '0.5px',
      },
    },
  },
  plugins: [],
}
