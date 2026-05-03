import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import healthHandler from './api/health.js'
import loginHandler from './api/auth/login.js'
import registerHandler from './api/auth/register.js'
import latestHandler from './api/market/latest.js'
import historyHandler from './api/market/history.js'
import { readJsonBody } from './api/lib/readJsonBody.js'

function createApiMiddleware(handler, options = {}) {
  const { parseJsonBody = false } = options

  return async (req, res) => {
    const requestUrl = new URL(req.url || '', 'http://localhost')
    const query = Object.fromEntries(requestUrl.searchParams.entries())

    let body
    if (parseJsonBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        body = await readJsonBody(req)
      } catch {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Invalid JSON body' }))
        return
      }
    }

    const requestPayload = {
      method: req.method,
      query,
      ...(body !== undefined ? { body } : {}),
    }

    const responseAdapter = {
      setHeader: (...args) => {
        res.setHeader(...args)
      },
      status(code) {
        res.statusCode = code
        return responseAdapter
      },
      json(payload) {
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
        }
        res.end(JSON.stringify(payload))
      },
      end(payload) {
        res.end(payload)
      },
    }

    try {
      await handler(requestPayload, responseAdapter)
    } catch {
      responseAdapter.status(500).json({ error: 'Local API failed' })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  plugins: [
    react(),
    {
      name: 'local-market-api',
      configureServer(server) {
        server.middlewares.use('/api/health', createApiMiddleware(healthHandler))
        server.middlewares.use(
          '/api/auth/register',
          createApiMiddleware(registerHandler, { parseJsonBody: true }),
        )
        server.middlewares.use(
          '/api/auth/login',
          createApiMiddleware(loginHandler, { parseJsonBody: true }),
        )
        server.middlewares.use('/api/market/latest', createApiMiddleware(latestHandler))
        server.middlewares.use('/api/market/history', createApiMiddleware(historyHandler))
      },
    },
  ],
})
