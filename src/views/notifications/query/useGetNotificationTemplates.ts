import { useQuery } from '@tanstack/vue-query'
import { getNotificationTemplates } from '../api'
import type { GetNotificationTemplatesParams } from '../types'
import type { Ref } from 'vue'

export const useGetNotificationTemplates = (params: Ref<GetNotificationTemplatesParams>) => {
  return useQuery({
    queryKey: ['notification-templates', params],
    queryFn: () => getNotificationTemplates(params.value)
  })
}
