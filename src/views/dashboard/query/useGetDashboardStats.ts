import { useQuery } from '@tanstack/vue-query'
import { fetchSchoolsNumber } from '../api'
import type { SchoolsNumberParams } from '../type'
import type { Ref } from 'vue'

export const useGetDashboardStats = (params: Ref<SchoolsNumberParams>) => {
  return useQuery({
    queryKey: ['dashboard-stats', params],
    queryFn: () => fetchSchoolsNumber(params.value),
    select: (res) => res.data.result,
    staleTime: 30000,
    gcTime: 60000
  })
}
