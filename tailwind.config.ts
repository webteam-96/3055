import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rotary-blue': '#17458F',
        'rotary-green': '#2E5339',
        'card-brown': '#372616',
        'card-gold': '#E59E2C',
        'card-navy': '#2F4366',
        'card-teal': '#2F5755',
        'header-peach': '#E8D8CE',
        'header-cream': '#FFE8C4',
        'header-slate': '#8D9FBE',
        'header-mint': '#88BAB5',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
