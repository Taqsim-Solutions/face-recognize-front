import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { allocateBalance } from '../api'
import type { AllocateBalanceRequest } from '../types'

export const useAllocateBalance = (eposTerminalId: number, organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AllocateBalanceRequest) =>
      allocateBalance(eposTerminalId, organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['terminal-balance', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    }
  })
}
