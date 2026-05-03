import { createSession, findUser, normalizeEmail } from './store.js'

/** Local demo: password is not verified; any value is accepted if the account exists. */

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

  if (!email) {
    res.status(400).json({ error: 'VALIDATION' })
    return
  }

  const user = findUser(email)
  if (!user) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    return
  }

  const token = createSession(user.email)

  res.status(200).json({
    token,
    user: { email: user.email, fullName: user.fullName },
  })
}
