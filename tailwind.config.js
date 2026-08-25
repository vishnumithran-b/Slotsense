/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: '#B7E5BA',
        'soft-green': '#5CA87C',
        jade: '#288760',
        'deep-green': '#1A5140',
        ink: '#0a1f17',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
        glow: '0 0 24px rgba(40,135,96,0.45)',
        'glow-strong': '0 0 40px rgba(40,135,96,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0)', opacity: '0.2' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0.2' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(40,135,96,0.4)' },
          '50%': { boxShadow: '0 0 32px rgba(40,135,96,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '120' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'scan-line': 'scan-line 2.8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'dash-flow': 'dash-flow 1.2s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [],
};
