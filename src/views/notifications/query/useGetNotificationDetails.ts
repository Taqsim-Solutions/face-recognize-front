import { useQuery } from '@tanstack/vue-query'
import { getNotificationDetails } from '../api'
import type { Ref } from 'vue'

export const useGetNotificationDetails = (id: Ref<string | undefined>) => {
  return useQuery({
    queryKey: ['notification-details', id],
    queryFn: () => getNotificationDetails(id.value!),
    enabled: () => !!id.value
  })
}
