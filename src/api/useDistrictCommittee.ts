import { useQuery } from '@tanstack/react-query'
import type { DistrictCommitteeResult } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

export async function fetchDistrictCommittee(groupID: string, yearfilter: string): Promise<DistrictCommitteeResult> {
  const res = await fetch(`${API_BASE}/DistrictCommittee/districtCommitteeList`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupID, searchText: '', yearfilter }),
  })
  const data = await res.json()
  return {
    members: data?.TBDistrictCommitteeResult?.Result?.districtCommitteeWithoutCatList ?? [],
    categories: data?.TBDistrictCommitteeResult?.Result?.districtCommitteeWithCatList ?? [],
  }
}

export function useDistrictCommittee(groupID: string, yearfilter: string) {
  return useQuery({
    queryKey: ['districtCommittee', groupID, yearfilter],
    queryFn: () => fetchDistrictCommittee(groupID, yearfilter),
  })
}
