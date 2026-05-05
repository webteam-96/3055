import { useQuery } from '@tanstack/react-query'
import type { ClubMember } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchClubMembers(grpID: string, financialyear: string): Promise<ClubMember[]> {
  const res = await fetch(`${API_BASE}/FindClub/GetClubMembers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grpID, searchText: '', financialyear }),
  })
  const data = await res.json()
  let members = data?.TBMemberList?.Result?.Table
  if (members && !Array.isArray(members)) members = [members]
  return Array.isArray(members) ? members : []
}

export function useClubMembers(grpID: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubMembers', grpID, financialyear],
    queryFn: () => fetchClubMembers(grpID, financialyear),
    enabled: !!grpID,
  })
}
