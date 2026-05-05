import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCommitteeDetails } from './useCommitteeDetails'

const mockData = {
  TBDistrictCommitteeDetailsResult: {
    Result: {
      district_sub_Committee: [{ pk_District_sub_Committee_id: '1', name: 'Zone A' }],
      district_sub_Committee_Details_list: [],
      districtCommitteeWithoutCatList: [{ name: 'Member A', DistrictDesignation: 'Chair', ClubName: '', MobileNumber: '', BloodGroup: '', Bloodgrp: '', MailID: '', Address: '', DOB: '', DOA: '', RotaryID: '', img: '', SpouseName: '', Spouse_Mobile_Number: '', SpouseMobileNumber: '', Keywords: '', classification: '' }],
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

describe('useCommitteeDetails', () => {
  it('returns sub-committees and direct members', async () => {
    const { result } = renderHook(() => useCommitteeDetails('42', '34307'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.subCommittees[0].name).toBe('Zone A')
    expect(result.current.data?.directMembers[0].name).toBe('Member A')
  })
  it('is disabled when committeeId is empty', () => {
    const { result } = renderHook(() => useCommitteeDetails('', '34307'), { wrapper })
    expect(result.current.status).toBe('pending')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
