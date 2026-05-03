import { getBearerToken } from './bearer.js'
import { getUserFromSessionToken } from '../auth/store.js'

/**
 * Resolve the signed-in user from `Authorization: Bearer <token>`.
 * Returns null when missing/invalid (handlers should respond with 401).
 *
 * @param {{ headers?: import('http').IncomingHttpHeaders }} request
 * @returns {{ email: string, fullName: string } | null}
 */
export function requireAuthUser(request) {
  const token = getBearerToken(request.headers)
  if (!token) {
    return null
  }
  return getUserFromSessionToken(token)
}
