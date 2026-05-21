import { useMutation } from '@tanstack/vue-query'
import { activateIntegratorApiKey } from '../api'

export const useActivateIntegratorApiKey = () => {
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      activateIntegratorApiKey(id, { isActive })
  })
}
