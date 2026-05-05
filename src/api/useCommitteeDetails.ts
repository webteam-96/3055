import { useQuery } from '@tanstack/react-query'
import type { DistrictCommitteeMember, SubCommittee } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

export interface CommitteeDetailsData {
  subCommittees: SubCommittee[]
  subCommitteeMembers: DistrictCommitteeMember[]
  directMembers: DistrictCommitteeMember[]
}

async function fetchCommitteeDetails(committeeId: string, groupID: string): Promise<CommitteeDetailsData> {
  const res = await fetch(`${API_BASE}/DistrictCommittee/districtCommitteeDetails/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ DistrictCommitteID: committeeId, groupID }),
  })
  const data = await res.json()
  const result = data?.TBDistrictCommitteeDetailsResult?.Result ?? {}
  return {
    subCommittees: result.district_sub_Committee ?? [],
    subCommitteeMembers: result.district_sub_Committee_Details_list ?? [],
    directMembers: result.districtCommitteeWithoutCatList ?? [],
  }
}

export function useCommitteeDetails(committeeId: string, groupID = '34307') {
  return useQuery({
    queryKey: ['committeeDetails', committeeId, groupID],
    queryFn: () => fetchCommitteeDetails(committeeId, groupID),
    enabled: !!committeeId,
  })
}
