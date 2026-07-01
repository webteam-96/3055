import { useQuery } from '@tanstack/react-query'
import type { AgZone, OtherDistrict } from '../types/directory'

// Generic loader for the static directory JSON files served from /public/data.
// Data is never hardcoded in the bundle — it is fetched from these files so it
// can be edited/regenerated independently.
export function useDirectoryJson<T>(file: string) {
  return useQuery({
    queryKey: ['directoryJson', file],
    queryFn: async (): Promise<T> => {
      const res = await fetch(`/data/${file}`)
      if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`)
      return res.json()
    },
    staleTime: 60 * 60 * 1000,
  })
}

export const useAgZones = () => useDirectoryJson<AgZone[]>('agZones.json')
export const useOtherDistricts = () => useDirectoryJson<OtherDistrict[]>('otherDistricts.json')
