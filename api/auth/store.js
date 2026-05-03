import { randomBytes } from 'node:crypto'

/** In-memory users and sessions (dev / local only; resets when dev server restarts). */

const usersByEmail = new Map()
const sessions = new Map()

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function createUser({ email, fullName, passwordHash }) {
  const key = normalizeEmail(email)
  if (usersByEmail.has(key)) {
    return { ok: false, reason: 'EMAIL_TAKEN' }
  }
  usersByEmail.set(key, {
    email: key,
    fullName: String(fullName || '').trim(),
    passwordHash,
  })
  return { ok: true }
}

export function findUser(email) {
  return usersByEmail.get(normalizeEmail(email))
}

export function createSession(email) {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, {
    email: normalizeEmail(email),
    createdAt: Date.now(),
  })
  return token
}

export function getUserFromSessionToken(token) {
  const key = String(token || '').trim()
  if (!key) {
    return null
  }
  const row = sessions.get(key)
  if (!row) {
    return null
  }
  const user = findUser(row.email)
  if (!user) {
    return null
  }
  return { email: user.email, fullName: user.fullName }
}

export function destroySession(token) {
  return sessions.delete(String(token || '').trim())
}
