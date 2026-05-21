import type { Ref } from 'vue'
import type { FetchEposTerminalsParams } from '../type'

import { useQuery } from '@tanstack/vue-query'
import { fetchEposTerminals } from '../api'

export const useGetTerminals = (params: Ref<FetchEposTerminalsParams>) => {
  return useQuery({
    queryKey: ['epos-terminals', params],
    queryFn: async () => fetchEposTerminals(params.value),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
