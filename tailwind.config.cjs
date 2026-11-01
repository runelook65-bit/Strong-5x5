/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      colors: {
        oled: '#07080a',
        card: '#121418',
        cardHover: '#181b21',
        borderDark: '#232730',
        accentGreen: '#10b981',
        accentGreenDark: '#064e3b',
        accentAmber: '#f59e0b',
        accentRed: '#ef4444'
      }
    }
  },
  plugins: []
};
