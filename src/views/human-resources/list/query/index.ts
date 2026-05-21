import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchEmployeeLeaves } from '../api'
import { FetchEmployeeLeavesParams } from '../types'

export const useGetEmployeeLeaves = (params: Ref<FetchEmployeeLeavesParams>) => {
  return useQuery({
    queryKey: ['employee-leaves', () => params.value],
    queryFn: async () => fetchEmployeeLeaves(params.value),
    staleTime: 600000,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
