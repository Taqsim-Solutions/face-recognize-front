import { useQuery } from '@tanstack/vue-query'
import { fetchAttendanceStats } from '../api'

export const useGetAttendanceStats = () => {
  return useQuery({
    queryKey: ['attendance-stats'],
    queryFn: () => fetchAttendanceStats(),
    staleTime: 600000,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
