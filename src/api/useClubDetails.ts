import { useDistrictDirectory, selectClubDetails } from './districtDirectory'

// `groupId` is the club id (pk_club_id) selecting the club from the unified
// response. `financialyear` is retained for call-site compatibility.
export function useClubDetails(groupId: string, _financialyear?: string) {
  return useDistrictDirectory((data) => selectClubDetails(data, groupId), !!groupId)
}
