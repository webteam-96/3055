import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubDetails } from './useClubDetails'
import { directoryFixture } from '../test-fixtures/directoryResponse'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => directoryFixture } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubDetails', () => {
  it('returns club basic info', async () => {
    const { result } = renderHook(() => useClubDetails('32285', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.basicInfo.Club_Name).toBe('Aadarsh Ahmedabad')
  })
  it('returns president data', async () => {
    const { result } = renderHook(() => useClubDetails('32285', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.president?.President_name).toBe('Pres Person')
  })
  it('returns null AG (not provided by the unified API)', async () => {
    const { result } = renderHook(() => useClubDetails('32285', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.ag).toBeNull()
  })
  it('is disabled when groupId is empty', () => {
    const { result } = renderHook(() => useClubDetails('', '2026-2027'), { wrapper })
    expect(result.current.status).toBe('pending')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
