import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubMembers } from './useClubMembers'

const mockData = {
  TBMemberList: {
    Result: {
      Table: [
        { memberName: 'Alice', MemberName: '', membermobile: '111', MemberMobile: '', designation: 'Member', Designation: '', pic: '', groupName: 'RC Alpha', MemberDOB: '', MemberDOA: '', MemberEmail: '', MemberAddress: '' }
      ]
    }
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubMembers', () => {
  it('returns array of members', async () => {
    const { result } = renderHook(() => useClubMembers('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].memberName).toBe('Alice')
  })
  it('wraps single object response in array', async () => {
    const singleMock = { TBMemberList: { Result: { Table: { memberName: 'Bob', MemberName: '', membermobile: '', MemberMobile: '', designation: '', Designation: '', pic: '', groupName: '', MemberDOB: '', MemberDOA: '', MemberEmail: '', MemberAddress: '' } } } }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => singleMock } as Response)
    const { result } = renderHook(() => useClubMembers('456', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})
