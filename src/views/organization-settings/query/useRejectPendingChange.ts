import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { rejectPendingChange } from '../api'

export const useRejectPendingChange = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectPendingChange(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-changes'] })
    }
  })
}
