/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ─── BRAND ─────────────────────────────────────────────────────────
        negro: '#1A1A1A',
        celeste: '#D5F3F7',
        rosa: '#EADEEA',
        lila: '#7786DA',

        // Naranja (antes red-brand). Mantenemos alias red-brand temporal.
        orange: {
          brand: '#FB451E',
          hover: '#E03A17',
          light: '#FFF2EF',
          DEFAULT: '#FB451E',
        },

        // ─── BLUE SCALE ────────────────────────────────────────────────────
        blue: {
          50:  '#EBF0FA',
          100: '#E8EDFE',
          200: '#8AA2ED',
          300: '#5477E4',
          400: '#335EDF',
          500: '#0034D7', // brand
          600: '#002FC4',
          700: '#0025A0',
          800: '#001D76',
          900: '#00165A',

          // Alias semánticos
          brand: '#0034D7',
          hover: '#0029B0',
          light: '#EBF0FA',
        },

        // ─── GREY SCALE ────────────────────────────────────────────────────
        grey: {
          50:  '#F9F9F9',
          100: '#E6E6E6',
          200: '#B4B4B4',
          300: '#929292',
          400: '#7D7D7D',
          500: '#5C5C5C',
          600: '#545454',
          700: '#414141',
          800: '#333333',
          900: '#272727',
        },

        // Alias retro-compatible (no romper código existente)
        gray: {
          mid: '#5C5C5C',     // grey-500
          border: '#E6E6E6',  // grey-100
          bg: '#F9F9F9',      // grey-50
        },

        // dark = Negro
        dark: '#1A1A1A',
      },

      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },

      // ─── TYPOGRAPHY TOKENS (mobile-first, este proyecto es mobile) ────────
      // result: Bold (sólo para el monto del resultado)
      // display, heading, cta, label: SemiBold
      // body, caption, overline, micro: Medium
      fontSize: {
        result:   ['24px', { lineHeight: '29px', fontWeight: '700' }],
        display:  ['20px', { lineHeight: '26px', fontWeight: '600' }],
        heading:  ['18px', { lineHeight: '24px', fontWeight: '600' }],
        cta:      ['17px', { lineHeight: '24px', fontWeight: '600' }],
        body:     ['15px', { lineHeight: '22px', fontWeight: '500' }],
        label:    ['15px', { lineHeight: '22px', fontWeight: '600' }],
        caption:  ['12px', { lineHeight: '18px', fontWeight: '500' }],
        overline: ['11px', { lineHeight: '16px', fontWeight: '500' }],
        micro:    ['13px', { lineHeight: '19px', fontWeight: '500' }],
      },

      // ─── RADII ─────────────────────────────────────────────────────────────
      // DS: sm=8 (chips/badges), md=12 (back/elementos pequeños),
      //     lg=16 (cards, inputs, CTA — el más usado), pill=99 (stepper/tags)
      borderRadius: {
        'ds-sm':   '8px',
        'ds-md':   '12px',
        'ds-lg':   '16px',
        'ds-pill': '99px',
      },

      // ─── BORDER WIDTHS ────────────────────────────────────────────────────
      // DS: default 0.5px · active 1.5px · focus 2px · disabled 0.5px
      borderWidth: {
        'hair': '0.5px',
        '1.5':  '1.5px',
      },

      // ─── ELEVATION ────────────────────────────────────────────────────────
      // Sólo elevation-1 está en uso (Navbar). Valora es una UI plana.
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1':
          '0 2px 4px rgba(0,0,0,0.04), 0 8px 8px rgba(0,0,0,0.03), 0 17px 10px rgba(0,0,0,0.02)',
      },

      keyframes: {
        fadeUp: {
          '0%': { transform: 'translateY(16px)' },
          '100%': { transform: 'translateY(0)' },
        },
        checkIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease both',
        'fade-up-2': 'fadeUp 0.35s 0.08s ease both',
        'fade-up-3': 'fadeUp 0.35s 0.16s ease both',
        'check-in': 'checkIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both',
        'spin-loader': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
