/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      colors: {
      Sidebar: "#1C1C1C",
      MainScreen: "#1E1E1E",
      StatisticBoxesFill: "#292929",
      StatisticBoxesBorder: "#6E6E6E",
      darkMode1: "#1e293b",
      },
      extend: {
        keyframes: {
          slideDown: {
            '0%': { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          }
        },
        animation: {
          slideDown: 'slideDown 0.2s ease-out forwards'
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }