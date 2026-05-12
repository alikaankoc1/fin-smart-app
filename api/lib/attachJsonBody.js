import { readJsonBody } from './readJsonBody.js'

function bodyAlreadyParsed(req) {
  const b = req.body
  if (b == null) {
    return false
  }
  if (typeof b === 'string' || Buffer.isBuffer(b)) {
    return false
  }
  return typeof b === 'object'
}

/**
 * Vite dev middleware injects JSON on `req.body`. Vercel may also parse JSON.
 * If not, read the raw stream (Node IncomingMessage).
 *
 * @param {import('http').IncomingMessage & { body?: unknown }} req
 */
export async function attachJsonBody(req) {
  const method = String(req.method || '').toUpperCase()
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return
  }
  if (bodyAlreadyParsed(req)) {
    return
  }
  const ct = String(req.headers['content-type'] || '').toLowerCase()
  if (!ct.includes('application/json')) {
    req.body = {}
    return
  }
  try {
    req.body = await readJsonBody(req)
  } catch {
    req.body = {}
  }
}
