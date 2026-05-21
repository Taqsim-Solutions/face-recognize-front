import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createDeposit } from '../api'
import type { CreateDepositRequest } from '../types'

export const useCreateDeposit = (eposTerminalId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDepositRequest) => createDeposit(eposTerminalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['terminal', eposTerminalId] })
    }
  })
}
