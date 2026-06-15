import { useDistrictDirectory, selectClubsBOD } from './districtDirectory'

// All clubs (with AG/President/Secretary summary) from the unified API.
// Params retained for call-site compatibility only.
export function useClubsBOD(_groupId?: string, _financialyear?: string) {
  return useDistrictDirectory(selectClubsBOD)
}
