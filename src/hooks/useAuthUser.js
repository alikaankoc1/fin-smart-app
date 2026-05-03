import { useCallback, useEffect, useState } from 'react'
import { AUTH_TOKEN_KEY } from '../constants/auth'

/**
 * Loads current user from GET /api/auth/me using the token in sessionStorage.
 */
export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refetchKey, setRefetchKey] = useState(0)

  const refetch = useCallback(() => {
    setRefetchKey((k) => k + 1)
  }, [])

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

      const isInitial = refetchKey === 0

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
        if (!cancelled && isInitial) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refetchKey])

  return { user, loading, refetch }
}
