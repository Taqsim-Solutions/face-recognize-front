import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { deleteDeposit } from '../api'

export const useDeleteDeposit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eposTerminalId, depositId }: { eposTerminalId: number; depositId: string }) =>
      deleteDeposit(eposTerminalId, depositId),
    onSuccess: (_, { eposTerminalId }) => {
      queryClient.invalidateQueries({ queryKey: ['deposits', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['terminal', eposTerminalId] })
    }
  })
}
