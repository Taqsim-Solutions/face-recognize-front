import { useQuery } from '@tanstack/vue-query'
import { fetchWeeklyPerformance } from '../api'
import type { MaybeRefOrGetter } from 'vue'

export const useGetWeeklyPerformance = (params: MaybeRefOrGetter<{ RegionId?: number; CityId?: number }>) => {
  return useQuery({
    queryKey: ['weekly-performance', params],
    queryFn: () => {
      const resolvedParams = typeof params === 'function' ? params() : 'value' in params ? params.value : params
      return fetchWeeklyPerformance(resolvedParams)
    },
    select: (res) => res.data.result,
    staleTime: 30000,
    gcTime: 60000
  })
}
