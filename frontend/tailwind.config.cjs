/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
        strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-electric-green) / <alpha-value>)',
          dark: 'rgb(var(--color-green-dark) / <alpha-value>)',
          hover: 'rgb(var(--color-green-hover) / <alpha-value>)',
        },
        cyan: 'rgb(var(--color-cyan) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        // Backwards-compatible aliases for existing page components.
        'bg-base': 'rgb(var(--color-background) / <alpha-value>)',
        'bg-surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'bg-raised': 'rgb(var(--color-elevated) / <alpha-value>)',
        'bg-border': 'rgb(var(--color-border-subtle) / <alpha-value>)',
        'accent-green': 'rgb(var(--color-electric-green) / <alpha-value>)',
        'accent-green-light': 'rgb(var(--color-green-hover) / <alpha-value>)',
        'accent-green-dark': 'rgb(var(--color-green-dark) / <alpha-value>)',
        'accent-cyan': 'rgb(var(--color-cyan) / <alpha-value>)',
        'warn-amber': 'rgb(var(--color-warning) / <alpha-value>)',
        'danger-red': 'rgb(var(--color-danger) / <alpha-value>)',
        'success-green': 'rgb(var(--color-success) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'metric': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgb(var(--color-electric-green) / 0.16)',
        'glow-cyan': '0 0 20px rgb(var(--color-cyan) / 0.16)',
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
