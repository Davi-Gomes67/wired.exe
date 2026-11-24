/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080D09',
        carbon: '#0B120D',
        panel: '#101A12',
        panelLight: '#162219',
        line: '#243128',
        muted: '#829688',
        electric: {
          DEFAULT: '#39FF70',
          light: '#7CFF9C',
          dark: '#1FA64A',
          dim: 'rgba(57,255,112,0.10)',
        },
        cyber: {
          DEFAULT: '#00FF41',
          light: '#66FF8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(57,255,112,0.28), 0 18px 50px -18px rgba(57,255,112,0.45)',
        cyber: '0 0 0 1px rgba(0,255,65,0.22), 0 14px 40px -18px rgba(0,255,65,0.35)',
        soft: '0 20px 60px -30px rgba(0,0,0,0.85)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(57,255,112,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,112,0.045) 1px, transparent 1px)',
        'hero-radial': 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(57,255,112,0.14), transparent 60%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,255,65,0.06), transparent 55%)',
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
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(.2,.8,.2,1) both',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
