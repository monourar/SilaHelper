/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sila: {
          bg: '#F5EFE6',
          parchment: '#E9DED0',
          parchmentDark: '#DBCBB9',
          card: 'rgba(255, 255, 255, 0.72)',
          cardSolid: '#FAF6F0',
          border: 'rgba(255, 255, 255, 0.85)',
          borderSubtle: 'rgba(168, 109, 45, 0.12)',
          text: '#241C16',
          muted: '#85796C',
          amber: '#A86D2D',
          amberLight: '#C28A45',
          amberSoft: '#F6EBDD',
          amberHover: '#955F25',
          green: '#287A46',
          greenSoft: '#E6F3EB',
          red: '#D94444',
          redSoft: '#FCEBEB',
          blue: '#3A6BA5',
          blueSoft: '#EAF1F8',
        }
      },
      fontFamily: {
        arabic: [
          '"Thmanyah Sans"',
          '"IBM Plex Sans Arabic"',
          'Tajawal',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
      },
      borderRadius: {
        'ios-sm': '12px',
        'ios-md': '18px',
        'ios-lg': '22px',
        'ios-xl': '26px',
        'ios-2xl': '32px',
      },
      boxShadow: {
        'glass': '0 8px 30px -4px rgba(60, 40, 20, 0.08), 0 2px 6px rgba(36, 28, 22, 0.03)',
        'glass-sm': '0 4px 16px -2px rgba(60, 40, 20, 0.06), 0 1px 3px rgba(36, 28, 22, 0.02)',
        'glass-hover': '0 12px 36px -4px rgba(60, 40, 20, 0.12), 0 3px 8px rgba(36, 28, 22, 0.04)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.85)',
        'nav': '0 -4px 24px -2px rgba(60, 40, 20, 0.08), 0 -1px 3px rgba(36, 28, 22, 0.03)',
      },
      backdropBlur: {
        'ios': '20px',
      }
    },
  },
  plugins: [],
}
