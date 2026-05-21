import { useMutation } from '@tanstack/vue-query'
import { createIntegratorApiKey } from '../api'

export const useCreateIntegratorApiKey = () => {
  return useMutation({
    mutationFn: (data: { name: string; isActive: true }) => createIntegratorApiKey(data)
  })
}
