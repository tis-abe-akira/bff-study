import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#00d4ff',
          50: '#f0fcff',
          100: '#e0f9ff',
          200: '#baf3ff',
          300: '#7de9ff',
          400: '#38ddff',
          500: '#00d4ff',
          600: '#00a8d4',
          700: '#0086aa',
          800: '#00708c',
          900: '#065d73',
        },
        secondary: {
          DEFAULT: '#00ff88',
          50: '#f0fff8',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00ff88',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          50: '#faf7ff',
          100: '#f4edff',
          200: '#ebe0ff',
          300: '#d9c3ff',
          400: '#c197ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#8b5cf6',
          800: '#7c3aed',
          900: '#6b21a8',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
        cyber: {
          blue: '#00d4ff',
          green: '#00ff88',
          purple: '#8b5cf6',
          pink: '#ff0080',
          dark: '#0a0a0a',
          'dark-light': '#1a1a1a',
          text: '#e5e5e5',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00ff88 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cyber-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow': '0 0 30px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.6)' },
        },
        'cyber-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)' },
        },
      },
      fontFamily: {
        'cyber': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config