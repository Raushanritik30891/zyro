/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        voidBlack: "#000000",
        voidDark: "#09090b",
        rosePink: "#f43f5e",
        roseGlow: "#fb7185",
        auraPurple: "#a855f7",
      },
      fontFamily: {
        gaming: ['"Orbitron"', 'sans-serif'], 
        body: ['"Rajdhani"', 'sans-serif'],
      },
      animation: {
        'pulse-evil': 'pulseEvil 3s infinite',
      },
      keyframes: {
        pulseEvil: {
          '0%, 100%': { boxShadow: '0 0 10px #f43f5e' }, 
          '50%': { boxShadow: '0 0 30px #a855f7, 0 0 15px #f43f5e' },
        }
      }
    },
  },
  plugins: [],
}