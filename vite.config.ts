import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
  ],
  server: {
    proxy: {
      // Proxy image requests through the dev server so fetch() has no CORS issues.
      // Usage: fetch('/img-proxy/uploads/photo.jpg')
      //   → proxied to: https://rotaryindiaapi.rosteronwheels.com/uploads/photo.jpg
      '/img-proxy': {
        target: 'https://rotaryindiaapi.rosteronwheels.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img-proxy/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
