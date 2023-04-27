/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [require('tailwindcss-flip'), require('daisyui')],
  daisyui: {
    rtl: true,
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          primary: '#6972F1',
          'primary-focus': '#5F67D9',
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#E8E8E8',
          100: '#D0D1D2',
          200: '#B9BABB',
          300: '#A2A3A4',
          400: '#8A8D8D',
          500: '#737677',
          600: '#5C5F60',
          700: '#454849',
          800: '#2D3132',
          900: '#161A1C',
        },
        primary: {
          50: '#F0F1FE',
          100: '#D2D5FB',
          200: '#B4B8F8',
          300: '#969CF5',
          400: '#7880F2',
          500: '#6972F1',
          600: '#5F67D9',
          700: '#4A50A9',
          800: '#353979',
          900: '#202248',
        },
      },
    },
  },
};
