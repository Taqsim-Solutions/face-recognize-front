import { useQuery } from '@tanstack/vue-query'
import { getNotificationReceivers } from '../api'
import type { GetNotificationReceiversParams } from '../types'
import type { Ref } from 'vue'

export const useGetNotificationReceivers = (
  id: Ref<string | undefined>,
  params: Ref<GetNotificationReceiversParams>
) => {
  return useQuery({
    queryKey: ['notification-receivers', id, params],
    queryFn: () => getNotificationReceivers(id.value!, params.value),
    enabled: () => !!id.value
  })
}
