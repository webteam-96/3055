import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubsBOD } from './useClubsBOD'
import { directoryFixture } from '../test-fixtures/directoryResponse'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => directoryFixture } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubsBOD', () => {
  it('returns clubs with president/secretary summary', async () => {
    const { result } = renderHook(() => useClubsBOD('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].clubName).toBe('Aadarsh Ahmedabad')
    expect(result.current.data?.[0].President_member_name).toBe('Pres Person')
  })
})
