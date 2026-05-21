import type { Ref } from 'vue'
import type { FetchManualPaymentsParams } from '../types'

import { useQuery } from '@tanstack/vue-query'
import { fetchManualPayments } from '../api'

export const useGetManualPayments = (params: Ref<FetchManualPaymentsParams>) => {
  return useQuery({
    queryKey: ['manual-payments', params],
    queryFn: async () => fetchManualPayments(params.value)
  })
}
