import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateNotificationTemplateState } from '../api'
import type { NotificationTemplateState } from '../types'

export const useUpdateNotificationTemplateState = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, state }: { id: number; state: NotificationTemplateState }) =>
      updateNotificationTemplateState(id, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    }
  })
}
