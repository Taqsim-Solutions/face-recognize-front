import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { syncBalance } from '../api'

export const useSyncBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eposTerminalId: number) => syncBalance(eposTerminalId),
    onSuccess: (_, eposTerminalId) => {
      queryClient.invalidateQueries({
        queryKey: ['deposits', eposTerminalId]
      })
    }
  })
}
