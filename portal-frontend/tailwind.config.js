/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FB",
        primary: "#1A1A2E",
        secondary: "#6B7280",
        accent: {
          dept: "#4F6EF7",
          hostel: "#0FA67A",
        },
        priority: {
          P0: "#EF4444",
          P1: "#F59E0B",
          P2: "#10B981",
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.06)',
        'soft-hover': '0 10px 25px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '16px',
      },
      animation: {
        'bounce-x': 'bounce-x 1s infinite',
      },
      keyframes: {
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(-25%)', 'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateX(0)', 'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)' },
        }
      }
    },
  },
  plugins: [],
}
