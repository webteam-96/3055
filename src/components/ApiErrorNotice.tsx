import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApiAuthError, isTokenExpired, login, setStoredToken } from '../api/authToken'
import { directoryQueryKey } from '../api/districtDirectory'

/**
 * Error state for API-backed pages. Auth failures (expired/invalid token) get
 * a recovery panel — log in for a fresh token, or paste one directly — so the
 * site can be revived without a rebuild. Anything else shows `fallback`.
 */
export function ApiErrorNotice({
  error,
  fallback = 'Failed to load data.',
}: {
  error: unknown
  fallback?: string
}) {
  if (!(error instanceof ApiAuthError)) {
    return <div className="p-8 text-center text-red-500">{fallback}</div>
  }
  return <SessionExpiredPanel />
}

function SessionExpiredPanel() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  // Reset (not just invalidate) so pages drop back to their loading state and
  // refetch with the new token instead of sitting on the stale error.
  const retry = () => queryClient.resetQueries({ queryKey: directoryQueryKey })

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await login(email.trim(), password)
      await retry()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePaste(e: FormEvent) {
    e.preventDefault()
    const token = pasted.trim()
    if (!token) return
    if (isTokenExpired(token)) {
      setMessage('That token is already expired — please obtain a fresh one.')
      return
    }
    setStoredToken(token)
    setMessage('')
    await retry()
  }

  const inputCls =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#17458F]'

  return (
    <div className="no-print min-h-[60vh] flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#3b251a] mb-1">API session expired</h2>
        <p className="text-sm text-gray-600 mb-4">
          The directory API token has expired, so data cannot be loaded. Log in to get a fresh
          token, or paste a new token below.
        </p>

        <form onSubmit={handleLogin} className="space-y-3 mb-5">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#17458F] text-white rounded py-2 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Log in & reload data'}
          </button>
        </form>

        <form onSubmit={handlePaste} className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Or paste an API token
          </label>
          <textarea
            rows={3}
            placeholder="eyJhbGciOi…"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            className={`${inputCls} font-mono break-all`}
          />
          <button
            type="submit"
            disabled={busy || !pasted.trim()}
            className="w-full border border-[#17458F] text-[#17458F] rounded py-2 text-sm font-semibold disabled:opacity-50"
          >
            Use this token
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}
