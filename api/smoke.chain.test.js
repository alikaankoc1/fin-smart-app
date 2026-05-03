/**
 * Same assertions as scripts/api-smoke.mjs, without HTTP (works in restricted CI).
 */
import { describe, expect, it } from 'vitest'
import healthHandler from './health.js'
import registerHandler from './auth/register.js'
import meHandler from './auth/me.js'

function makeRes() {
  let code = 200
  /** @type {unknown} */
  let payload
  const res = {
    setHeader() {},
    status(c) {
      code = c
      return res
    },
    json(p) {
      payload = p
    },
    end() {},
    get statusCode() {
      return code
    },
    get body() {
      return payload
    },
  }
  return res
}

describe('API smoke chain (in-process)', () => {
  it('health → register → me matches smoke script', async () => {
    const hRes = makeRes()
    await healthHandler({ method: 'GET', query: {}, headers: {} }, hRes)
    expect(hRes.statusCode).toBe(200)
    expect(hRes.body).toMatchObject({ ok: true, service: 'fin-smart-api' })

    const email = `chain+${Date.now()}@example.com`
    const regRes = makeRes()
    await registerHandler(
      {
        method: 'POST',
        query: {},
        headers: {},
        body: {
          fullName: 'Chain Smoke',
          email,
          password: 'secret12',
        },
      },
      regRes,
    )
    expect(regRes.statusCode).toBe(201)
    const token = regRes.body?.token
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)

    const unauth = makeRes()
    await meHandler({ method: 'GET', query: {}, headers: {} }, unauth)
    expect(unauth.statusCode).toBe(401)

    const ok = makeRes()
    await meHandler(
      {
        method: 'GET',
        query: {},
        headers: { authorization: `Bearer ${token}` },
      },
      ok,
    )
    expect(ok.statusCode).toBe(200)
    expect(ok.body?.user?.email).toBe(email.toLowerCase())
  })
})
