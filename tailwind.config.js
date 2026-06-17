/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc3fb',
          400: '#34a5f7',
          500: '#0b8aeb',
          600: '#026cc3',
          700: '#03569e',
          800: '#074a81',
          900: '#0c3e6b',
          950: '#082749',
        },
        tcs: {
          gray: '#f5f5f5',
          border: '#dcdcdc',
          blue: '#1a5f7a',
          hover: '#0f4c61',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
