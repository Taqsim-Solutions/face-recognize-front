import { useQuery } from '@tanstack/vue-query'
import { getPendingChanges } from '../api'
import type { PendingChangesResponse } from '../types'
import { computed, type Ref } from 'vue'

export const useGetPendingChanges = (params: Ref<any>) => {
  return useQuery<PendingChangesResponse>({
    queryKey: computed(() => ['pending-changes', { ...params.value }]),
    queryFn: async () => {
      const res = await getPendingChanges(params.value)
      return res.data
    }
  })
}
