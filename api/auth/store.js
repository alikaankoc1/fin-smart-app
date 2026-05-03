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
  const createdAt = Date.now()
  usersByEmail.set(key, {
    email: key,
    fullName: String(fullName || '').trim(),
    passwordHash,
    createdAt,
  })
  return { ok: true }
}

export function updatePasswordHash(email, newPasswordHash) {
  const key = normalizeEmail(email)
  const row = usersByEmail.get(key)
  if (!row) {
    return false
  }
  row.passwordHash = newPasswordHash
  return true
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
  return {
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt ?? null,
  }
}

export function destroySession(token) {
  return sessions.delete(String(token || '').trim())
}

/**
 * Remove user and every session for that email (e.g. account deletion).
 * @returns {boolean} true if a user row existed
 */
export function deleteUserAndSessions(email) {
  const key = normalizeEmail(email)
  const tokensToRemove = []
  for (const [t, row] of sessions.entries()) {
    if (row.email === key) {
      tokensToRemove.push(t)
    }
  }
  tokensToRemove.forEach((t) => sessions.delete(t))
  return usersByEmail.delete(key)
}
