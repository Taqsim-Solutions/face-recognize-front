import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { initializeNotification } from '../api'
import type { InitializeNotificationRequest } from '../types'

export const useInitializeNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InitializeNotificationRequest) => initializeNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-dashboard'] })
    }
  })
}
