/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#0f172a',
        panel: '#1e293b',
      },
    },
  },
  plugins: [],
}
