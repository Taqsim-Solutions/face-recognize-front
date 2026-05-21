import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateNotificationTemplate } from '../api'
import type { UpdateNotificationTemplateRequest } from '../types'

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationTemplateRequest }) =>
      updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    }
  })
}
