import { useDistrictDirectory, selectCommitteeDetails } from './districtDirectory'
import type { DistrictCommitteeMember, SubCommittee } from '../types/api'

export interface CommitteeDetailsData {
  subCommittees: SubCommittee[]
  subCommitteeMembers: DistrictCommitteeMember[]
  directMembers: DistrictCommitteeMember[]
}

// `committeeId` selects a committee group from the unified response.
// `groupID` is retained for call-site compatibility only.
export function useCommitteeDetails(committeeId: string, _groupID = '') {
  return useDistrictDirectory((data) => selectCommitteeDetails(data, committeeId), !!committeeId)
}
