import { useEffect, useState } from 'react'
import { AUTH_TOKEN_KEY } from '../constants/auth'

/**
 * Loads current user from GET /api/auth/me using the token in sessionStorage.
 */
export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      await Promise.resolve()
      if (cancelled) {
        return
      }

      const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error('me_failed')
        }
        const data = await res.json()
        if (!cancelled && data?.user) {
          setUser(data.user)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading }
}
