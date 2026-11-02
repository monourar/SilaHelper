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
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'md': '0 2px 4px -1px rgba(60, 40, 20, 0.04)',
        'lg': '0 4px 8px -2px rgba(60, 40, 20, 0.04)',
        'xl': '0 6px 12px -3px rgba(60, 40, 20, 0.05)',
        '2xl': '0 8px 16px -4px rgba(60, 40, 20, 0.06)',
        'glass': '0 1px 3px 0 rgba(60, 40, 20, 0.03)',
        'glass-sm': '0 1px 2px 0 rgba(60, 40, 20, 0.02)',
        'glass-hover': '0 2px 5px -1px rgba(60, 40, 20, 0.04)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
        'nav': '0 -1px 4px 0 rgba(60, 40, 20, 0.03)',
      },
      backdropBlur: {
        'ios': '20px',
      }
    },
  },
  plugins: [],
}
