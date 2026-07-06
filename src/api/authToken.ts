// ---------------------------------------------------------------------------
// Auth token management for the rizones district-directory API.
//
// The API needs a Bearer JWT that expires (~a few weeks). The original build
// shipped a hardcoded token, which silently broke every page when it expired.
// Tokens are now resolved at request time in priority order:
//   1. localStorage override — set from the in-app "session expired" panel,
//      so a fresh token can be applied without rebuilding/redeploying.
//   2. VITE_RZ_API_TOKEN env var (build-time).
//   3. The committed fallback below (last known good token).
// Expired candidates are skipped when a live one is available.
// ---------------------------------------------------------------------------

export const API_BASE = import.meta.env.DEV ? '/rzapi' : 'https://rizones45678.org/API'

const STORAGE_KEY = 'rz_api_token'

// Last token supplied for this district. Expired 2026-07-04 — kept only as a
// final fallback; replace via login/paste (localStorage) or VITE_RZ_API_TOKEN.
const FALLBACK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6Ijg0MDUwMyIsIm5hbWUiOiJLYWxwZXNoIEEiLCJlbWFpbCI6IndlYkBrYWl6ZW5pbmZvdGVjaC5jb20iLCJyb2xlcyI6IkFkbWluLE1lbWJlciIsImxvZ2luVHlwZSI6Im1vYmlsZSIsIm1lbWJlclR5cGUiOiJtZW1iZXIiLCJpbWVpIjoiMWMxMTZjOTBjNTgzNjdiN2MzMjJmYzdkZDIyYmQ1YTMiLCJleHAiOjE3ODMxNjIxNjAsImlzcyI6Ikp3dElzc3VlciIsImF1ZCI6Ikp3dEF1ZGllbmNlIn0.EkKMZEHbNfTkwvVno70xb-m3Yu0ZSx_cHlws4a8dyH8'

/** Thrown when the API rejects the request as unauthenticated (401/403). */
export class ApiAuthError extends Error {
  constructor(message = 'API session expired or unauthorized.') {
    super(message)
    this.name = 'ApiAuthError'
  }
}

/** Decode a JWT's `exp` claim → epoch milliseconds, or null if unreadable. */
export function tokenExpiryMs(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64)) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = tokenExpiryMs(token)
  return exp != null && exp <= Date.now()
}

export function getStoredToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token.trim())
  } catch {
    // storage unavailable (private mode) — token just won't persist
  }
}

/**
 * Token to send with API requests: first non-expired candidate by priority,
 * falling back to the highest-priority non-empty one (the server is the final
 * authority — a token with an unreadable exp may still be valid).
 */
export function getActiveToken(): string {
  const candidates = [
    getStoredToken(),
    (import.meta.env.VITE_RZ_API_TOKEN as string | undefined) ?? '',
    FALLBACK_TOKEN,
  ].filter((t) => t.trim() !== '')
  return candidates.find((t) => !isTokenExpired(t)) ?? candidates[0] ?? ''
}

// Find a JWT anywhere in the login response — field names vary across .NET
// auth implementations (token / accessToken / jwtToken / nested data.token…),
// so match on shape (three dot-separated base64url segments) instead.
function findJwt(value: unknown): string | null {
  if (typeof value === 'string') {
    return /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(value.trim()) ? value.trim() : null
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) {
      const found = findJwt(v)
      if (found) return found
    }
  }
  return null
}

/**
 * Log in against the rizones auth endpoint and store the returned token.
 * Throws with the server's message on failure.
 */
export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, Password: password }),
  })
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // non-JSON response — handled below
  }
  if (!res.ok) {
    const message =
      (body as { message?: string } | null)?.message ?? `Login failed (${res.status}).`
    throw new Error(message)
  }
  const token = findJwt(body)
  if (!token) throw new Error('Login succeeded but no token was found in the response.')
  setStoredToken(token)
  return token
}
