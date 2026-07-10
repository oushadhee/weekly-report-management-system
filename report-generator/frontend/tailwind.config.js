/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF6F3',
          100: '#D0E6DD',
          200: '#B2D7C7',
          300: '#94C7B1',
          400: '#76B79B',
          500: '#549E7E',
          600: '#48896D',
          700: '#386B55',
          800: '#284D3D',
          900: '#192F25',
          950: '#09110D',
        }
      }
    },
  },
  plugins: [],
}