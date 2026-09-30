/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Geist', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Geist Mono"', '"Martian Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
        'geist-mono': ['"Geist Mono"', 'monospace'],
        'martian-mono': ['"Martian Mono"', 'monospace'],
      },
      colors: {
        navy: {
          50: '#f0f4fc',
          100: '#e2ebf8',
          200: '#c5d7f2',
          300: '#98bce8',
          400: '#649bdc',
          500: '#3e7cd0',
          600: '#2a61b8',
          700: '#1f4c97',
          800: '#1a3e7b',
          900: '#103178', // Official ChemExpress Blue
          950: '#0b2050',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c91e8',
          600: '#0274c7',
          700: '#035ca2',
          800: '#074e85',
          900: '#103178',
          950: '#07244a',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 8px -2px rgba(16, 49, 120, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 12px 28px -4px rgba(16, 49, 120, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
