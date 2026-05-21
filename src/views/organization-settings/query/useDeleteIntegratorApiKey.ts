import { useMutation } from '@tanstack/vue-query'
import { deleteIntegratorApiKey } from '../api'

export const useDeleteIntegratorApiKey = () => {
  return useMutation({
    mutationFn: (id: string) => deleteIntegratorApiKey(id)
  })
}
