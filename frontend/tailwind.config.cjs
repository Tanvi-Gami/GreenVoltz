/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background palette
        'bg-base':    '#0a0e14',   // near-black, main background
        'bg-surface': '#111827',   // slightly lighter, card/panel surface
        'bg-raised':  '#1f2937',   // hover / elevated surface
        'bg-border':  '#374151',   // subtle borders

        // Brand
        'accent-green': {
          DEFAULT: '#22d3a5',      // electric teal-green — primary actions
          light:   '#5eead4',
          dark:    '#0f9d7a',
        },
        'accent-cyan': {
          DEFAULT: '#06b6d4',      // secondary highlight
          light:   '#67e8f9',
          dark:    '#0891b2',
        },

        // Status
        'warn-amber': {
          DEFAULT: '#f59e0b',
          light:   '#fcd34d',
          dark:    '#d97706',
        },
        'danger-red': {
          DEFAULT: '#ef4444',
          light:   '#fca5a5',
          dark:    '#dc2626',
        },
        'success-green': {
          DEFAULT: '#22c55e',
          light:   '#86efac',
        },

        // Text hierarchy
        'text-primary':   '#f9fafb',
        'text-secondary': '#9ca3af',
        'text-muted':     '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'metric': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34, 211, 165, 0.25)',
        'glow-cyan':  '0 0 20px rgba(6, 182, 212, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-in':   'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },              to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
