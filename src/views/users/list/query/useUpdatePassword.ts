import { useMutation } from '@tanstack/vue-query'
import { updatePassword } from '../api'

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string | number; newPassword: string }) =>
      updatePassword({ id, newPassword })
  })
}
