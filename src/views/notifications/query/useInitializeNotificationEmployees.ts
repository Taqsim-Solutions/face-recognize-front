import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { initializeNotificationEmployees } from '../api'
import type { InitializeNotificationEmployeesRequest } from '../types'

export const useInitializeNotificationEmployees = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InitializeNotificationEmployeesRequest) => initializeNotificationEmployees(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-dashboard'] })
    }
  })
}
