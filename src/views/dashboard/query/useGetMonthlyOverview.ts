import { useQuery } from '@tanstack/vue-query'
import { fetchMonthlyOverview } from '../api'
import type { MaybeRefOrGetter } from 'vue'

export const useGetMonthlyOverview = (params: MaybeRefOrGetter<{ RegionId?: number; CityId?: number }>) => {
  return useQuery({
    queryKey: ['monthly-overview', params],
    queryFn: () => {
      const resolvedParams = typeof params === 'function' ? params() : 'value' in params ? params.value : params
      return fetchMonthlyOverview(resolvedParams)
    },
    select: (res) => res.data.result,
    staleTime: 30000,
    gcTime: 60000
  })
}
