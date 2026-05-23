import { useQuery } from '@tanstack/vue-query'
import { fetchAbsents } from '../api'
import type { MaybeRefOrGetter } from 'vue'

export const useGetAbsents = (
  params: MaybeRefOrGetter<{
    RegionId?: number
    CityId?: number
    SchoolId?: number
    ClassId?: number
    DateFrom?: string
    DateTo?: string
    PageIndex?: number
    isDescending?: boolean
  }>
) => {
  return useQuery({
    queryKey: ['absents-list', params],
    queryFn: async () => {
      const resolvedParams =
        typeof params === 'function' ? params() : 'value' in params ? params.value : params
      const res = await fetchAbsents(resolvedParams)
      return res.data.result
    },
    staleTime: 10000,
    gcTime: 30000
  })
}
