import { useQuery } from '@tanstack/vue-query'
import { getAccountInfo } from '../api'

export const useGetAccountInfo = () => {
  return useQuery({
    queryKey: ['account-info'],
    queryFn: async () => getAccountInfo(),
    select: (data) => data.data
  })
}
