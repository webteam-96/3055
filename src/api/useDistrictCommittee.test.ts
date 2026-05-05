import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useDistrictCommittee } from './useDistrictCommittee'

const mockData = {
  TBDistrictCommitteeResult: {
    Result: {
      districtCommitteeWithoutCatList: [
        { name: 'Test Member', DistrictDesignation: 'DG', ClubName: 'RC Test', MobileNumber: '', BloodGroup: '', Bloodgrp: '', MailID: '', Address: '', DOB: '', DOA: '', RotaryID: '', img: '', SpouseName: '', Spouse_Mobile_Number: '', SpouseMobileNumber: '', Keywords: '', classification: '' }
      ],
      districtCommitteeWithCatList: [
        { Fk_DistrictCommitteeID: '1', name: 'Youth Committee' }
      ],
    },
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockData,
  } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useDistrictCommittee', () => {
  it('returns members and categories', async () => {
    const { result } = renderHook(() => useDistrictCommittee('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.members[0].name).toBe('Test Member')
    expect(result.current.data?.categories[0].name).toBe('Youth Committee')
  })
  it('calls the correct API endpoint', async () => {
    renderHook(() => useDistrictCommittee('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('districtCommitteeList'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
