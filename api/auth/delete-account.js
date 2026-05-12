import { attachJsonBody } from '../lib/attachJsonBody.js'
import { verifyPassword } from '../lib/password.js'
import { requireAuthUser } from '../lib/requireAuth.js'
import { deleteUserAndSessions, findUser } from './store.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  await attachJsonBody(req)

  const authUser = requireAuthUser(req)
  if (!authUser) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  const body = req.body || {}
  const password = String(body.password ?? '')

  if (!password) {
    res.status(400).json({ error: 'VALIDATION' })
    return
  }

  const full = findUser(authUser.email)
  if (!full || !verifyPassword(password, full.passwordHash)) {
    res.status(401).json({ error: 'INVALID_PASSWORD' })
    return
  }

  deleteUserAndSessions(authUser.email)
  res.status(200).json({ ok: true })
}
