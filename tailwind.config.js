/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        setu: {
          bg: '#e9e5dc',
          surface: '#f7f5ef',
          card: '#ffffff',
          border: '#d8d1c4',
          borderLight: '#c5bcad',
          muted: '#706b62',
          textMuted: '#5f5b54',
          text: '#182433',
          accent: '#a33b32',
          accentHover: '#822e27',
          accentLight: '#c45247',
          lead: '#a66b1f',
          leadHover: '#855418',
          auditAlert: '#a33b32',
          verified: '#39735c',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
