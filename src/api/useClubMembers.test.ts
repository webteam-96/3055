import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubMembers } from './useClubMembers'
import { directoryFixture } from '../test-fixtures/directoryResponse'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => directoryFixture } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubMembers', () => {
  it('returns the roster for the selected club', async () => {
    const { result } = renderHook(() => useClubMembers('32285', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].memberName).toBe('Member One')
  })
  it('is disabled when club id is empty', () => {
    const { result } = renderHook(() => useClubMembers('', '2026-2027'), { wrapper })
    expect(result.current.status).toBe('pending')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
