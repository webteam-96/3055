import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubsBOD } from './useClubsBOD'

const mockData = {
  ClubListResult: {
    Clubs: [
      { grpID: '1', clubName: 'RC Alpha', AG_Name: 'AG 1', AG_MobileNumber: '', AG_EmailID: '', AG_DOB: '', AG_Photo: '', President_member_name: 'Pres A', President_member_email_id: '', President_member_mobile_no: '', President_Profile_Photo: '', Secreatary_member_name: 'Sec A', Secreatary_email_id: '', Secreatary_mobile_no: '', Secreatary_Profile_Photo: '' }
    ]
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubsBOD', () => {
  it('returns array of clubs', async () => {
    const { result } = renderHook(() => useClubsBOD('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].clubName).toBe('RC Alpha')
  })
})
