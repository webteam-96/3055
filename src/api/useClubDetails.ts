import { useQuery } from '@tanstack/react-query'
import type { ClubDetailsData } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchClubDetails(groupId: string, financialyear: string): Promise<ClubDetailsData> {
  const res = await fetch(`${API_BASE}/District/Get_Clubs_BOD_Details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, financialyear }),
  })
  const data = await res.json()
  const result = data?.ClubListResult?.FinalResult
  if (!result?.BasicInfo?.length) throw new Error('No club data')
  const ag = Array.isArray(result.AG) ? (result.AG[0] ?? null) : (result.AG ?? null)
  return {
    basicInfo: result.BasicInfo[0],
    ag,
    president: result.President?.[0] ?? null,
    secretary: result.Secretary?.[0] ?? null,
    bod: result.BOD ?? [],
    presidentPhoto: result.President_Profile_Photo1 ?? '',
  }
}

export function useClubDetails(groupId: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubDetails', groupId, financialyear],
    queryFn: () => fetchClubDetails(groupId, financialyear),
    enabled: !!groupId,
  })
}
