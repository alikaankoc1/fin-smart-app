import { describe, expect, it } from 'vitest'
import { API_ROUTES } from './routes.manifest.js'

describe('API_ROUTES manifest', () => {
  it('lists every mounted path exactly once', () => {
    const paths = API_ROUTES.map((r) => r.path)
    const unique = new Set(paths)
    expect(unique.size).toBe(paths.length)
  })

  it('covers auth, market, health, and example', () => {
    const paths = new Set(API_ROUTES.map((r) => r.path))
    expect(paths.has('/api/health')).toBe(true)
    expect(paths.has('/api/auth/me')).toBe(true)
    expect(paths.has('/api/market/latest')).toBe(true)
    expect(paths.has('/api/example/protected')).toBe(true)
  })
})
