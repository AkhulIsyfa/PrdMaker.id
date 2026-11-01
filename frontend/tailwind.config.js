/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          charcoal: '#111827',
          offwhite: '#F9FAFB',
          coolgrey: '#D1D5DB',
          darkgrey: '#374151',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          purewhite: '#FFFFFF',
          almostblack: '#030712',
          cardDark: '#0B0F19',
          borderDark: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionDuration: {
        300: '300ms',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        elevation: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

