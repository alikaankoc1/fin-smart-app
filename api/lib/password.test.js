import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password.js'

describe('password', () => {
  it('round-trips verify after hash', () => {
    const hash = hashPassword('correct horse battery')
    expect(verifyPassword('correct horse battery', hash)).toBe(true)
    expect(verifyPassword('wrong', hash)).toBe(false)
  })
})
