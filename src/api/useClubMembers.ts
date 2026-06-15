import { useDistrictDirectory, selectClubMembers } from './districtDirectory'

// `grpID` is the club id (pk_club_id) selecting the club's roster from the
// unified response. `financialyear` is retained for call-site compatibility.
export function useClubMembers(grpID: string, _financialyear?: string) {
  return useDistrictDirectory((data) => selectClubMembers(data, grpID), !!grpID)
}
