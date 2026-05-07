import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchImageAsBase64 } from './fetchImageAsBase64'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchImageAsBase64', () => {
  it('returns empty string for empty URL', async () => {
    const result = await fetchImageAsBase64('')
    expect(result).toBe('')
  })

  it('returns empty string for undefined', async () => {
    const result = await fetchImageAsBase64(undefined as unknown as string)
    expect(result).toBe('')
  })

  it('returns empty string when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const result = await fetchImageAsBase64('https://example.com/photo.jpg')
    expect(result).toBe('')
  })

  it('returns empty string when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await fetchImageAsBase64('https://example.com/photo.jpg')
    expect(result).toBe('')
  })
})
