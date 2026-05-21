import type { AttendancesFetchParams } from '../types'
import type { Ref } from 'vue'

import { useQuery } from '@tanstack/vue-query'
import { fetchAttendances } from '../api'

export const useGetAttendances = (params: Ref<AttendancesFetchParams>) => {
  return useQuery({
    queryKey: ['attendances', params],
    queryFn: () => fetchAttendances(params.value),
    staleTime: 600000,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
