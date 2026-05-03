import { hashPassword } from '../lib/password.js'
import { createSession, createUser, normalizeEmail } from './store.js'

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
  const fullName = String(body.fullName || '').trim()
  const email = normalizeEmail(body.email)
  const password = String(body.password || '')

  if (fullName.length < 2) {
    res.status(400).json({ error: 'VALIDATION', field: 'fullName' })
    return
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'VALIDATION', field: 'email' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'VALIDATION', field: 'password' })
    return
  }

  const passwordHash = hashPassword(password)
  const result = createUser({ email, fullName, passwordHash })

  if (!result.ok) {
    res.status(409).json({ error: 'EMAIL_TAKEN' })
    return
  }

  const token = createSession(email)

  res.status(201).json({
    token,
    user: { email, fullName },
  })
}
