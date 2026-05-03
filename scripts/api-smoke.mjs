/**
 * Manual smoke: start dev server (`npm run dev`), then:
 *   npm run smoke:api
 * Override base URL: API_BASE=http://localhost:5174 npm run smoke:api
 */
const base = (process.env.API_BASE || 'http://localhost:5173').replace(/\/$/, '')

async function main() {
  const healthRes = await fetch(`${base}/api/health`)
  if (!healthRes.ok) throw new Error(`GET /api/health → ${healthRes.status}`)
  const health = await healthRes.json()
  if (!health.ok) throw new Error('health payload missing ok:true')

  const meNoAuth = await fetch(`${base}/api/auth/me`)
  if (meNoAuth.status !== 401) {
    throw new Error(`GET /api/auth/me without token expected 401, got ${meNoAuth.status}`)
  }

  const email = `smoke+${Date.now()}@example.com`
  const regRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Api Smoke',
      email,
      password: 'secret12',
    }),
  })
  if (!regRes.ok) {
    const err = await regRes.text()
    throw new Error(`POST /api/auth/register → ${regRes.status} ${err}`)
  }
  const reg = await regRes.json()
  if (!reg.token) throw new Error('register response missing token')

  const meRes = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${reg.token}` },
  })
  if (!meRes.ok) throw new Error(`GET /api/auth/me with token → ${meRes.status}`)
  const me = await meRes.json()
  if (me.user?.email !== email) throw new Error('me user email mismatch')

  console.log('smoke: ok', { base, health: health.service, user: me.user.email })
}

main().catch((e) => {
  console.error('smoke: failed', e.message)
  process.exit(1)
})
