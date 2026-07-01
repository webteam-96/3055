import { useState, useEffect } from 'react'

export type ViewMode = 'web' | 'print'

// Web vs Print view for the directory pages. Print view renders the Border.svg
// B5 sheets (what the PDF looks like); web view renders a normal responsive
// page. Persisted so the choice sticks across navigation.
export function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => {
    // A `?view=print|web` query param wins over the persisted choice — lets the
    // print view be deep-linked (and screenshotted) directly.
    if (typeof location !== 'undefined') {
      const q = new URLSearchParams(location.search).get('view')
      if (q === 'print' || q === 'web') return q
    }
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('dirViewMode') : null
    return saved === 'print' ? 'print' : 'web'
  })
  useEffect(() => {
    try {
      localStorage.setItem('dirViewMode', mode)
    } catch {
      /* ignore */
    }
  }, [mode])
  return [mode, setMode]
}
