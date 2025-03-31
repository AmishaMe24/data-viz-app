/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      maxHeight: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      scale: {
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-85': '85vh',
      },
    },
  },
  plugins: [],
}

