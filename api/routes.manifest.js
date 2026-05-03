/**
 * Local API inventory — paths wired in vite.config.js `configureServer`.
 * Production (e.g. Vercel) uses the same file paths under /api.
 */
export const API_ROUTES = [
  {
    path: '/api/health',
    methods: ['GET', 'OPTIONS'],
    auth: false,
    notes: 'Liveness; JSON { ok, service }',
  },
  {
    path: '/api/auth/register',
    methods: ['POST', 'OPTIONS'],
    auth: false,
    notes: 'Body: fullName, email, password → 201 + token',
  },
  {
    path: '/api/auth/login',
    methods: ['POST', 'OPTIONS'],
    auth: false,
    notes: 'Body: email, password → 200 + token',
  },
  {
    path: '/api/auth/logout',
    methods: ['POST', 'OPTIONS'],
    auth: false,
    notes: 'Optional Bearer; destroys session; 204',
  },
  {
    path: '/api/auth/me',
    methods: ['GET', 'OPTIONS'],
    auth: true,
    notes: 'Bearer required → 200 { user } or 401',
  },
  {
    path: '/api/auth/update-password',
    methods: ['PATCH', 'POST', 'OPTIONS'],
    auth: true,
    notes: 'Bearer; body currentPassword, newPassword',
  },
  {
    path: '/api/auth/delete-account',
    methods: ['POST', 'OPTIONS'],
    auth: true,
    notes: 'Bearer; body password — removes user and all sessions',
  },
  {
    path: '/api/market/latest',
    methods: ['GET', 'OPTIONS'],
    auth: false,
    notes: 'JSON { rows, sourceUpdatedAt }; FX + metals; no-store; 502 if upstream fails',
  },
  {
    path: '/api/market/history',
    methods: ['GET', 'OPTIONS'],
    auth: false,
    notes: 'Query: instrumentId, range, interval',
  },
  {
    path: '/api/example/protected',
    methods: ['GET', 'OPTIONS'],
    auth: true,
    notes: 'Sample Bearer-only route',
  },
]
