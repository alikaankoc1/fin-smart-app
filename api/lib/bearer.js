/**
 * @param {import('http').IncomingHttpHeaders | Record<string, string | string[] | undefined>} headers
 * @returns {string | null}
 */
export function getBearerToken(headers) {
  if (!headers || typeof headers !== 'object') {
    return null
  }
  const raw = headers.authorization ?? headers.Authorization
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) {
    return null
  }
  const token = value.slice(7).trim()
  return token || null
}
