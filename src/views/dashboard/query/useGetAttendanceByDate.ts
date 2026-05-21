import { useQuery } from '@tanstack/vue-query'
import { fetchAttendanceByDate } from '../api'
import type { FetchEmployeeAttendanceParams } from '../type'

export const useGetAttendanceByDate = (params: FetchEmployeeAttendanceParams) => {
  return useQuery({
    queryKey: ['attendance-by-date', params],
    queryFn: () => fetchAttendanceByDate(params)
  })
}
