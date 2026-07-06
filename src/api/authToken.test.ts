import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenExpiryMs, isTokenExpired, getActiveToken, setStoredToken } from './authToken'

const b64url = (obj: object) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const makeJwt = (payload: object) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`

const FUTURE = Math.floor(Date.now() / 1000) + 3600
const PAST = Math.floor(Date.now() / 1000) - 3600

describe('tokenExpiryMs', () => {
  it('decodes the exp claim to epoch ms', () => {
    expect(tokenExpiryMs(makeJwt({ exp: 1783162160 }))).toBe(1783162160 * 1000)
  })
  it('returns null for malformed tokens', () => {
    expect(tokenExpiryMs('not-a-jwt')).toBeNull()
    expect(tokenExpiryMs('a.%%%.c')).toBeNull()
    expect(tokenExpiryMs(makeJwt({}))).toBeNull()
  })
})

describe('isTokenExpired', () => {
  it('is true for a past exp, false for a future exp', () => {
    expect(isTokenExpired(makeJwt({ exp: PAST }))).toBe(true)
    expect(isTokenExpired(makeJwt({ exp: FUTURE }))).toBe(false)
  })
  it('treats an unreadable exp as not expired (server decides)', () => {
    expect(isTokenExpired('opaque-token')).toBe(false)
  })
})

describe('getActiveToken', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllEnvs())

  it('prefers a live localStorage token over the committed fallback', () => {
    const live = makeJwt({ exp: FUTURE })
    setStoredToken(live)
    expect(getActiveToken()).toBe(live)
  })

  it('skips an expired localStorage token when a live env token exists', () => {
    const live = makeJwt({ exp: FUTURE })
    vi.stubEnv('VITE_RZ_API_TOKEN', live)
    setStoredToken(makeJwt({ exp: PAST }))
    expect(getActiveToken()).toBe(live)
  })

  it('falls back to the highest-priority candidate when all are expired', () => {
    const expired = makeJwt({ exp: PAST })
    setStoredToken(expired)
    // The committed fallback is also expired, so the stored one wins on priority.
    expect(getActiveToken()).toBe(expired)
  })
})
