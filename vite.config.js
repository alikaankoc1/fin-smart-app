import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import latestHandler from './api/market/latest.js'
import historyHandler from './api/market/history.js'

function createApiMiddleware(handler) {
  return async (req, res) => {
    const requestUrl = new URL(req.url || '', 'http://localhost')
    const query = Object.fromEntries(requestUrl.searchParams.entries())

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
      await handler(
        {
          method: req.method,
          query,
        },
        responseAdapter,
      )
    } catch {
      responseAdapter.status(500).json({ error: 'Local API failed' })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-market-api',
      configureServer(server) {
        server.middlewares.use('/api/market/latest', createApiMiddleware(latestHandler))
        server.middlewares.use('/api/market/history', createApiMiddleware(historyHandler))
      },
    },
  ],
})
