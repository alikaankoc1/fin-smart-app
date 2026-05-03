import { hashPassword, verifyPassword } from '../lib/password.js'
import { requireAuthUser } from '../lib/requireAuth.js'
import { findUser, updatePasswordHash } from './store.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'PATCH' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const authUser = requireAuthUser(req)
  if (!authUser) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  const body = req.body || {}
  const currentPassword = String(body.currentPassword ?? '')
  const newPassword = String(body.newPassword ?? '')

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'VALIDATION', field: 'newPassword' })
    return
  }

  const full = findUser(authUser.email)
  if (!full || !verifyPassword(currentPassword, full.passwordHash)) {
    res.status(401).json({ error: 'INVALID_CURRENT_PASSWORD' })
    return
  }

  updatePasswordHash(full.email, hashPassword(newPassword))
  res.status(200).json({ ok: true })
}
