import type { Ref } from 'vue'
import type { FetchPaymentsParams } from '../types'

import { useQuery } from '@tanstack/vue-query'
import { fetchPayments } from '../api'

export const useGetPayments = (params: Ref<FetchPaymentsParams>) => {
  return useQuery({
    queryKey: ['salary-payments', params],
    queryFn: async () => fetchPayments(params.value),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
