/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark base palette
        surface: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#161f3a',
          600: '#1e2d4f',
          500: '#253660',
        },
        // Accent - Electric Blue / Cyan
        accent: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#80dfff',
          300: '#4dd2ff',
          400: '#26c6ff',
          500: '#00baff',
          600: '#0099d6',
          700: '#0078ad',
          800: '#005885',
          900: '#003a5c',
        },
        // Positive - Emerald Green
        bull: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Negative - Red
        bear: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Gold for FII highlights
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0, 186, 255, 0.15)',
        'glow-bull': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-bear': '0 0 20px rgba(239, 68, 68, 0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
