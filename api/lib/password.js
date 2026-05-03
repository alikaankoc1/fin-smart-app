import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SALT_BYTES = 16
const KEY_BYTES = 64

export function hashPassword(plain) {
  const salt = randomBytes(SALT_BYTES)
  const hash = scryptSync(plain, salt, KEY_BYTES)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export function verifyPassword(plain, stored) {
  const [saltHex, hashHex] = String(stored).split(':')
  if (!saltHex || !hashHex) {
    return false
  }
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const derived = scryptSync(plain, salt, KEY_BYTES)
  if (derived.length !== expected.length) {
    return false
  }
  return timingSafeEqual(derived, expected)
}
