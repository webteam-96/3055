import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCommitteeDetails } from './useCommitteeDetails'
import { directoryFixture } from '../test-fixtures/directoryResponse'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => directoryFixture } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useCommitteeDetails', () => {
  it('returns sub-committees and direct members for the selected group', async () => {
    const { result } = renderHook(() => useCommitteeDetails('100', '34307'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.subCommittees[0].name).toBe('Alpha Sub')
    expect(result.current.data?.directMembers[0].name).toBe('Direct Member')
  })
  it('is disabled when committeeId is empty', () => {
    const { result } = renderHook(() => useCommitteeDetails('', '34307'), { wrapper })
    expect(result.current.status).toBe('pending')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
