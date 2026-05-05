import { useQuery } from '@tanstack/react-query'
import type { ClubBODSummary } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchClubsBOD(groupId: string, financialyear: string): Promise<ClubBODSummary[]> {
  const res = await fetch(`${API_BASE}/District/Get_Clubs_BOD`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, financialyear }),
  })
  const data = await res.json()
  return data?.ClubListResult?.Clubs ?? []
}

export function useClubsBOD(groupId: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubsBOD', groupId, financialyear],
    queryFn: () => fetchClubsBOD(groupId, financialyear),
  })
}
