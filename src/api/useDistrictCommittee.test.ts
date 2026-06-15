import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useDistrictCommittee } from './useDistrictCommittee'
import { directoryFixture } from '../test-fixtures/directoryResponse'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => directoryFixture,
  } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useDistrictCommittee', () => {
  it('returns executive members and category cards', async () => {
    const { result } = renderHook(() => useDistrictCommittee('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.members[0].name).toBe('Naimish N. Ravani')
    expect(result.current.data?.categories.map((c) => c.name)).toContain('Alpha Group')
  })

  it('calls the unified API with a Bearer token', async () => {
    renderHook(() => useDistrictCommittee('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('district-directory'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer '),
        }),
      }),
    )
  })
})
