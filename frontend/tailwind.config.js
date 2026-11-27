/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--c-void) / <alpha-value>)',
        carbon: 'rgb(var(--c-carbon) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        panelLight: 'rgb(var(--c-panel-light) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        base: 'rgb(var(--c-text) / <alpha-value>)',
        sub: 'rgb(var(--c-sub) / <alpha-value>)',
        electric: {
          DEFAULT: 'rgb(var(--c-electric) / <alpha-value>)',
          light: 'rgb(var(--c-electric-light) / <alpha-value>)',
          dark: 'rgb(var(--c-electric-dark) / <alpha-value>)',
          dim: 'var(--c-electric-dim)',
        },
        cyber: {
          DEFAULT: 'rgb(var(--c-electric) / <alpha-value>)',
          light: 'rgb(var(--c-electric-light) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--c-electric) / 0.28), 0 18px 50px -18px rgb(var(--c-electric) / 0.45)',
        cyber: '0 0 0 1px rgb(var(--c-electric) / 0.22), 0 14px 40px -18px rgb(var(--c-electric) / 0.35)',
        soft: '0 20px 60px -30px rgb(0 0 0 / 0.25)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgb(var(--c-electric) / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-electric) / 0.045) 1px, transparent 1px)',
        'hero-radial': 'radial-gradient(ellipse 70% 60% at 70% 40%, rgb(var(--c-electric) / 0.14), transparent 60%), radial-gradient(ellipse 40% 40% at 20% 80%, rgb(var(--c-electric) / 0.06), transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(.2,.8,.2,1) both',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-soft': 'pulse-soft 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
