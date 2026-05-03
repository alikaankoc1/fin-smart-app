/**
 * Sample route protected by Bearer token — reuse this pattern for future APIs.
 */
import { requireAuthUser } from '../lib/requireAuth.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = requireAuthUser(req)
  if (!user) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  res.status(200).json({
    ok: true,
    message: 'Authenticated request accepted.',
    user,
  })
}
