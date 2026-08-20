/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Permite alternar modo oscuro usando la clase 'dark' en el <html>
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Classic Teal / Blue accent
          600: '#0d9488',
          900: '#134e4a',
        },
        dark: {
          bg: '#172225',
          surface: '#202d30',
          text: '#e5ecee'
        }
      }
    },
  },
  plugins: [],
}
