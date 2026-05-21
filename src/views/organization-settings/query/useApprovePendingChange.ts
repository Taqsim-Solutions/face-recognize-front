import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { approvePendingChange } from '../api'

export const useApprovePendingChange = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approvePendingChange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-changes'] })
    }
  })
}
