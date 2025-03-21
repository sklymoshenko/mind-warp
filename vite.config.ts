import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  optimizeDeps: {
    disabled: true, // this remove react is not defined
  },
  plugins: [solid(), tailwindcss()],
})
