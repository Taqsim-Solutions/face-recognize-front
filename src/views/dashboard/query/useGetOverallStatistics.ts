import { useQuery } from '@tanstack/vue-query'
import { fetchOverallStatistics } from '../api'
import type { MaybeRefOrGetter } from 'vue'

export const useGetOverallStatistics = (
  params: MaybeRefOrGetter<{
    RegionId?: number
    CityId?: number
    SchoolId?: number
    ClassId?: number
    DateFrom?: string
    DateTo?: string
  }>
) => {
  return useQuery({
    queryKey: ['overall-statistics', params],
    queryFn: async () => {
      const resolvedParams =
        typeof params === 'function' ? params() : 'value' in params ? params.value : params
      const res = await fetchOverallStatistics(resolvedParams)
      return res.data.result
    },
    staleTime: 10000,
    gcTime: 30000
  })
}
