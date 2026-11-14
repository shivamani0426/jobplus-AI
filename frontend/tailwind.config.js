/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { pulse: { violet: '#6455E8', ink: '#111829', mint: '#43C5B1' } },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Plus Jakarta Sans', 'sans-serif'] },
    },
  },
  plugins: [],
}
