import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
  ],
  // Dev-only proxy for the unified district-directory API. The API whitelists
  // CORS for the deployed origin but not localhost, so in dev we route
  // `/rzapi/*` through Vite (same-origin) to https://rizones45678.org/API/*.
  server: {
    proxy: {
      '/rzapi': {
        target: 'https://rizones45678.org/API',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/rzapi/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
