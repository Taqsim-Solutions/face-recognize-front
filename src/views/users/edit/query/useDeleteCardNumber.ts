import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { deleteEmployeeCardNumber } from '../api'

export function useDeleteCardNumber(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEmployeeCardNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`employee-${id}`]
      })
    }
  })
}
