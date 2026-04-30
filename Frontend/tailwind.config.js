/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-dark': 'rgb(var(--secondary-rgb) / <alpha-value>)',
        'secondary': 'rgb(var(--secondary-rgb) / <alpha-value>)',
        'success': 'rgb(var(--success-rgb) / <alpha-value>)',
        'danger': 'rgb(var(--danger-rgb) / <alpha-value>)',
        'warning': 'rgb(var(--warning-rgb) / <alpha-value>)',
        'bg-primary': 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary-rgb) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        'border-color': 'rgb(var(--border-color-rgb) / <alpha-value>)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count': 'count 2s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'count': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 180, 216, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 180, 216, 0.8)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
