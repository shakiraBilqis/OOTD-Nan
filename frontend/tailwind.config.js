/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ─── CLOSETTE Design Tokens ───────────────────────────────────────────
      colors: {
        // Primary palette
        ink: {
          DEFAULT: '#211F1D',
          light: '#3A3835',
          dark: '#141210',
        },
        ivory: {
          DEFAULT: '#F7F2EA',
          warm: '#EDE8E0',
          dark: '#DED8CE',
        },
        oatmeal: {
          DEFAULT: '#E6D9C7',
          dark: '#D4C5AE',
        },
        cognac: {
          DEFAULT: '#956344',
          light: '#B07D5A',
          dark: '#7A5038',
        },
        burgundy: {
          DEFAULT: '#702F40',
          light: '#8B3D51',
          dark: '#5A2534',
        },
        cobalt: {
          DEFAULT: '#3155C8',
          light: '#4A6CD6',
          dark: '#2340A0',
        },
        forest: {
          DEFAULT: '#315846',
          light: '#3D6C57',
          dark: '#264439',
        },
        butter: {
          DEFAULT: '#E9C96D',
          light: '#F0D88A',
          dark: '#D4B055',
        },
        terracotta: {
          DEFAULT: '#C96F52',
          light: '#D6896F',
          dark: '#B05843',
        },
        rose: {
          DEFAULT: '#D6A6A5',
          light: '#E2BCBB',
          dark: '#C49090',
        },

        // Semantic
        status: {
          success: '#315846',
          warning: '#E9C96D',
          error: '#702F40',
          info: '#3155C8',
        },
      },

      fontFamily: {
        heading: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-xl': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-md': ['1.25rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.35' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'label': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
      },

      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        'soft': '0 2px 20px rgba(33, 31, 29, 0.06)',
        'medium': '0 4px 40px rgba(33, 31, 29, 0.10)',
        'hard': '0 8px 60px rgba(33, 31, 29, 0.14)',
        'card': '0 1px 4px rgba(33, 31, 29, 0.08), 0 4px 16px rgba(33, 31, 29, 0.06)',
        'elevated': '0 8px 32px rgba(33, 31, 29, 0.12)',
        'glow-cognac': '0 0 40px rgba(149, 99, 68, 0.25)',
        'glow-ivory': '0 0 40px rgba(247, 242, 234, 0.5)',
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      backgroundImage: {
        'texture-linen': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23956344' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-cognac': 'linear-gradient(135deg, #956344 0%, #C96F52 100%)',
        'gradient-ink': 'linear-gradient(135deg, #211F1D 0%, #3A3835 100%)',
        'gradient-ivory': 'linear-gradient(135deg, #F7F2EA 0%, #E6D9C7 100%)',
        'gradient-editorial': 'linear-gradient(135deg, #211F1D 0%, #702F40 50%, #956344 100%)',
      },

      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
