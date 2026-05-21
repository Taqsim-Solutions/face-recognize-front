import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { getDepartments } from '../api'
import type { GetDepartmentsParams } from '../types'

export const useGetDepartments = (params: Ref<GetDepartmentsParams>) => {
  return useQuery({
    queryKey: computed(() => ['departments', params.value]),
    queryFn: () => getDepartments(params.value),
    staleTime: 600000,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (response) => ({
      data: response.data,
      headers: response.headers
    })
  })
}
