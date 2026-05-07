import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

// Image proxy middleware — mirrors the /api/proxy-image route in the 3170 Next.js project.
// Fetches any external image URL server-side and returns it to the browser.
// This bypasses CORS because the browser only sees a same-origin request to localhost.
function imageProxyPlugin(): Plugin {
  return {
    name: 'image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy-image', async (req, res) => {
        const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?') + 1) : ''
        const params = new URLSearchParams(qs)
        const url = params.get('url')

        const dummyPath = path.join(process.cwd(), 'public', 'images', 'dummy.jpg')
        const sendDummy = () => {
          try {
            const buf = fs.readFileSync(dummyPath)
            res.setHeader('Content-Type', 'image/jpeg')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            res.end(buf)
          } catch {
            res.statusCode = 404
            res.end()
          }
        }

        if (!url) { sendDummy(); return }

        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 8000)
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: ctrl.signal,
          })
          clearTimeout(timer)

          if (!response.ok) { sendDummy(); return }

          const contentType = response.headers.get('content-type') ?? 'image/jpeg'
          const buffer = await response.arrayBuffer()
          res.setHeader('Content-Type', contentType)
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(Buffer.from(buffer))
        } catch {
          sendDummy()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
    imageProxyPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
