import { useQuery } from '@tanstack/vue-query'
import { getDaysOff } from '../api'
import { unref } from 'vue'

export const useGetDaysOff = (params: any) => {
  return useQuery({
    queryKey: ['days-off', params],
    queryFn: () => getDaysOff(unref(params))
  })
}
