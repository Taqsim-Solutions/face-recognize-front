import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createNotificationTemplate } from '../api'
import type { CreateNotificationTemplateRequest } from '../types'

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNotificationTemplateRequest) => createNotificationTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    }
  })
}
