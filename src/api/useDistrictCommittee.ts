import { useDistrictDirectory, selectDistrictCommitteeResult } from './districtDirectory'

// Backed by the unified district-directory API. Params are retained for
// call-site compatibility but no longer affect the request (the single
// endpoint returns everything for the configured district + year).
export function useDistrictCommittee(_groupID?: string, _yearfilter?: string) {
  return useDistrictDirectory(selectDistrictCommitteeResult)
}
