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
        // GlobalCeilidh Brand Colours
        'tarheel': '#7BAFD4',        // Primary brand — the spiral
        'tarheel-dark': '#5A94BE',   // Darker tarheel for hover states
        'tarheel-light': '#A8CBE3',  // Lighter tarheel for backgrounds
        'tarheel-pale': '#E8F3FA',   // Very light tarheel for page backgrounds
        'cobalt': '#0047AB',         // Aileen's colour — accent
        'cobalt-dark': '#003A8C',    // Darker cobalt
        'cobalt-light': '#E6F1FB',   // Light cobalt backgrounds
        // Neutral
        'gc-dark': '#0f1923',        // Near black with blue tint
        'gc-mid': '#1e2d3d',         // Dark blue-grey
        'gc-text': '#2c3e50',        // Body text
        'gc-muted': '#6b7f8e',       // Muted text
        'gc-border': '#d1e3ee',      // Borders
        'gc-bg': '#f0f7fc',          // Page background
      },
      fontFamily: {
        'display': ['var(--font-cinzel)', 'Georgia', 'serif'],
        'body': ['var(--font-eb-garamond)', 'Georgia', 'serif'],
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
