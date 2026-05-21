import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { fetchTerminalById } from '../api'
import type { TerminalDetailResponse } from '../types'

export const useGetTerminalById = (eposTerminalId: Ref<number | undefined>) => {
  return useQuery({
    queryKey: computed(() => ['terminal', eposTerminalId.value]),
    queryFn: () => fetchTerminalById(eposTerminalId.value!),
    enabled: computed(() => !!eposTerminalId.value),
    select: (data): TerminalDetailResponse => data.data
  })
}
