/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#56ec6a',
          600: '#16a34a',
          900: '#14532d',
        },
        'accent': {
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
        'gecko': {
          'green': '#56ec6a',
          'blue': '#60a5fa',
          'dark': '#1f2937',
          'light': '#f9fafb',
        },
        // Keep some original colors for compatibility
        'void': '#0a0a0a',
        'degen-green': '#56ec6a',
        'solana-purple': '#9945ff',
        'rug-red': '#ef4444',
        'fomo-gold': '#fbbf24',
      },
      fontFamily: {
        'sans': ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'gecko': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out infinite alternate',
        'scroll': 'scroll 20s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      screens: {
        'xs': '475px',
      },
      zIndex: {
        '60': '60',
        '61': '61',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}