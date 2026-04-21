/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F8F9FA',
          dark: '#121212',
          mint: '#E8F5F1',
          primary: '#2D5A4F',
          orange: '#FF6B35'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.800'),
            fontSize: '16px',
            lineHeight: '1.75',
            h1: { color: theme('colors.slate.950'), fontWeight: '900' },
            h2: { color: theme('colors.slate.900'), fontWeight: '900' },
            h3: { color: theme('colors.slate.900'), fontWeight: '800' },
            p: { marginBottom: '1.5em' },
            a: { color: theme('colors.blue.600'), '&:hover': { color: theme('colors.blue.500') } },
          },
        },
        lg: {
          css: {
            fontSize: '18px',
            lineHeight: '1.8',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}
