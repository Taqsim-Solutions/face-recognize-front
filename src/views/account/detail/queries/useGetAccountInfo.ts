import { useQuery } from '@tanstack/vue-query'
import { getAccountInfo } from '../api'

export const useGetAccountInfo = () => {
  return useQuery({
    queryKey: ['account-info'],
    queryFn: async () => {
      const res = await getAccountInfo()
      if (res?.data?.result?.level !== undefined) {
        localStorage.setItem('user_level', String(res.data.result.level))
      }
      return res
    },
    select: (data) => data.data.result
  })
}
