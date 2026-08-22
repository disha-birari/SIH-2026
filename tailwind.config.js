/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: {
          900: '#06152b', // Official NIC Ashoka Navy
          800: '#0b1e36',
          700: '#142a4a',
          600: '#1e3a60'
        },
        govSaffron: {
          600: '#ff671f', // Official Saffron
          700: '#e64e05',
          800: '#c23b00'
        },
        govGreen: {
          600: '#138808', // Official India Green
          700: '#0d6505'
        },
        govGold: {
          500: '#f59e0b',
          600: '#d97706'
        },
        govBg: '#f8fafc'
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        hindi: ["'Mukta'", "'Hind'", "sans-serif"]
      }
    },
  },
  plugins: [],
};
