/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark base
        midnight: '#0a0f0d',
        obsidian: '#0d1512',
        slate: '#1a2420',
        // Primary - Emerald
        'aura-emerald': {
          dim: '#064e3b',
          glow: '#10b981',
          bright: '#34d399',
          light: '#6ee7b7',
        },
        // Secondary - Gold/Amber
        'aura-gold': {
          dim: '#78350f',
          glow: '#f59e0b',
          bright: '#fbbf24',
          light: '#fcd34d',
        },
        // Accent - Warm tones
        'aura-warm': {
          coral: '#f97316',
          rose: '#fb7185',
          sand: '#d4a574',
        },
        // Legacy aliases for compatibility
        'aura-cyan': {
          dim: '#064e3b',
          glow: '#10b981',
          bright: '#34d399',
        },
        'aura-blue': {
          dim: '#064e3b',
          glow: '#10b981',
          bright: '#34d399',
        },
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'grid-flow': 'grid-flow 20s linear infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'glow': {
          '0%': { 'box-shadow': '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { 'box-shadow': '0 0 40px rgba(16, 185, 129, 0.6)' }
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        'grid-flow': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
