import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createEmployeeCardNumber } from '../api'

export function useAddCardNumber(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEmployeeCardNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`employee-${id}`]
      })
    }
  })
}
