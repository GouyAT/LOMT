/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: '#07070c',
          900: '#0a0a0f',
          850: '#0e0e16',
          800: '#12121c',
          700: '#1a1a28',
          600: '#232336',
        },
        gold: {
          100: '#f7ecd0',
          200: '#f0d98c',
          300: '#e6c768',
          400: '#d4af37',
          500: '#b8941e',
          600: '#8a6d1f',
          700: '#6b5418',
        },
        blood: {
          500: '#8b0000',
          600: '#6b0505',
          700: '#4a0808',
        },
        curtain: {
          500: '#5c1414',
          600: '#431010',
          700: '#2e0a0a',
        },
        parchment: {
          100: '#f0e6cd',
          200: '#e6d9b8',
          300: '#d9c8a0',
          400: '#c4b088',
        },
        ink: {
          100: '#e8e2d0',
          200: '#cfc7b0',
          300: '#a89e83',
          400: '#7d745e',
          500: '#4a4435',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"Cinzel"', '"Noto Serif SC"', 'serif'],
        serifcn: ['"Noto Serif SC"', '"Songti SC"', '"STSong"', '"SimSun"', 'serif'],
        serifen: ['"EB Garamond"', '"Georgia"', 'serif'],
        prose: ['"EB Garamond"', '"Noto Serif SC"', '"Songti SC"', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 18px rgba(212,175,55,0.35), 0 0 42px rgba(212,175,55,0.12)',
        'gold-glow-sm': '0 0 8px rgba(212,175,55,0.28)',
        'blood-glow': '0 0 16px rgba(139,0,0,0.45)',
        'panel': '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(240,217,140,0.06)',
        'seal': '0 4px 14px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.14)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.86' },
          '60%': { opacity: '0.96' },
          '80%': { opacity: '0.8' },
        },
        'float-slow': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.45' } },
        'spin-slow': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'ember-rise': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-90px) scale(0.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.9s ease-out both',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'flicker': 'flicker 4.5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'shimmer': 'shimmer 3.2s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'spin-slow': 'spin-slow 26s linear infinite',
      },
    },
  },
  plugins: [],
}
