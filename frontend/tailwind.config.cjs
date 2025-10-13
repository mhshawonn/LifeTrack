/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4C6EF5',
          dark: '#364FC7',
          light: '#748FFC',
        },
        surface: {
          DEFAULT: '#0f172a',
          light: '#f8fafc',
          dark: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
};
