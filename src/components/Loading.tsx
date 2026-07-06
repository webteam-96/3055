import './Loading.css'

/**
 * Full-area loading indicator shown while a page's data is being fetched.
 * Replaces the old blank-screen (`return null`) states so it's always clear
 * that data is on its way rather than missing.
 */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="dir-loading no-print" role="status" aria-live="polite" aria-busy="true">
      <div className="dir-loading__spinner" aria-hidden="true" />
      <p className="dir-loading__text">{label}</p>
    </div>
  )
}
