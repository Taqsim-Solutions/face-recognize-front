import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { fetchDeposits } from '../api'
import type { DepositsListParams } from '../types'

export const useGetDeposits = (
  eposTerminalId: Ref<number | undefined>,
  params?: Ref<DepositsListParams | undefined>
) => {
  return useQuery({
    queryKey: computed(() => ['deposits', eposTerminalId.value, params?.value]),
    queryFn: () => fetchDeposits(eposTerminalId.value!, params?.value),
    enabled: computed(() => !!eposTerminalId.value),
    select: (data) => ({
      ...data,
      headers: data.headers
    })
  })
}
