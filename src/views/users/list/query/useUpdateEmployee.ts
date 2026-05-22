import { useMutation } from '@tanstack/vue-query'
import { updateEmployee } from '../api'

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateEmployee({ id, payload })
  })
}
