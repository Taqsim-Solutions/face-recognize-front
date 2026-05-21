import type { RequestsFetchParams } from '../types'
import type { Ref } from 'vue'

import { useQuery } from '@tanstack/vue-query'
import { fetchRequests } from '../api'

export const useGetRequests = (params: Ref<RequestsFetchParams>) => {
  return useQuery({
    queryKey: ['salary-requests', params],
    queryFn: () => fetchRequests(params.value)
  })
}
