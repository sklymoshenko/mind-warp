// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        trivia: {
          lime: 'hsl(var(--trivia-lime) / <alpha-value>)',
          void: 'hsl(var(--trivia-void) / <alpha-value>)',
          white: 'hsl(var(--trivia-white) / <alpha-value>)',
          accent: 'hsl(var(--trivia-accent) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
