import { useQuery } from '@tanstack/vue-query'
import { getNotificationDashboard } from '../api'
import type { GetNotificationDashboardParams } from '../types'
import { computed, type Ref } from 'vue'

export const useGetNotificationDashboard = (params: Ref<GetNotificationDashboardParams>) => {
  return useQuery({
    queryKey: ['notification-dashboard', params],
    queryFn: () => getNotificationDashboard(params.value),
    enabled: computed(() => !!params.value.templateId)
  })
}
