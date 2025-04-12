import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [solid(), tailwindcss()],
  server: {
    host: true,
  },
})
