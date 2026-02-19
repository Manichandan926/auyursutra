module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ayur: {
          forest: '#2C5E38', // Deep Forest Green
          earth: '#A87B5D',  // Warm Earthen Clay
          cream: '#F8F5F0',  // Creamy Off-White
          saffron: '#E2B36C', // Muted Saffron
          // Keeping legacy blues for dashboard compatibility if needed, or mapping them
          50: '#F8F5F0',
          100: '#E2B36C',
          200: '#C8A080',
          300: '#A87B5D',
          400: '#6C8C70',
          500: '#2C5E38',
          600: '#245030',
          700: '#1C3E26',
          800: '#152E1D',
          900: '#0E1F14',
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Open Sans', 'sans-serif'],
      }
    }
  },
  plugins: []
};
