import { verifyPassword } from '../lib/password.js'
import { createSession, findUser, normalizeEmail } from './store.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
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

  const body = req.body || {}
  const email = normalizeEmail(body.email)
  const password = String(body.password ?? '')

  if (!email || !password) {
    res.status(400).json({ error: 'VALIDATION' })
    return
  }

  const user = findUser(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    return
  }

  const token = createSession(user.email)

  res.status(200).json({
    token,
    user: {
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt ?? null,
    },
  })
}
