import { useQuery } from '@tanstack/vue-query'
import { getTerminalBalance } from '../api'

export const useGetTerminalBalance = (eposTerminalId: number) => {
  return useQuery({
    queryKey: ['terminal-balance', eposTerminalId],
    queryFn: () => getTerminalBalance(eposTerminalId),
    enabled: !!eposTerminalId,
    staleTime: 30000,
    refetchInterval: 60000
  })
}
