import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe7',
          300: '#a8bed3',
          400: '#789bba',
          500: '#577fa3',
          600: '#446588',
          700: '#37516f',
          800: '#31455d',
          900: '#2c3b4e',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ebe4d7',
          400: '#ddd0bc',
          500: '#cbb89d',
          600: '#b39b7e',
          700: '#8f7b60',
          800: '#75654f',
          900: '#615443',
        }
      },
    },
  },
  plugins: [],
}
export default config

