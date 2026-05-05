import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubDetails } from './useClubDetails'

const mockData = {
  ClubListResult: {
    FinalResult: {
      BasicInfo: [{ Club_Name: 'RC Alpha', Club_ID: '101', Charter_Date: '1990-01-01', Membership: '30' }],
      AG: { Name: 'AG Name', Designation: 'Assistant Governor', Mobile_number: '888', Emailid: 'ag@test.com', member_date_of_birth: '' },
      President: [{ President_name: 'Pres X', President_photo: '', Mobile_number: '111', President_DOB: '', President_EmialID: 'pres@test.com', DOA: '', address: '', RotaryID: '' }],
      Secretary: [],
      BOD: [],
      President_Profile_Photo1: '',
    },
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubDetails', () => {
  it('returns club basic info', async () => {
    const { result } = renderHook(() => useClubDetails('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.basicInfo.Club_Name).toBe('RC Alpha')
  })
  it('returns president data', async () => {
    const { result } = renderHook(() => useClubDetails('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.president?.President_name).toBe('Pres X')
  })
  it('returns null secretary when empty', async () => {
    const { result } = renderHook(() => useClubDetails('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.secretary).toBeNull()
  })
  it('is disabled when groupId is empty', () => {
    const { result } = renderHook(() => useClubDetails('', '2026-2027'), { wrapper })
    expect(result.current.status).toBe('pending')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
