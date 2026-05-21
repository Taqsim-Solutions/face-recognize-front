import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { releaseBalance } from '../api'
import type { ReleaseBalanceRequest } from '../types'

export const useReleaseBalance = (eposTerminalId: number, organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReleaseBalanceRequest) =>
      releaseBalance(eposTerminalId, organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['terminal-balance', eposTerminalId] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    }
  })
}
