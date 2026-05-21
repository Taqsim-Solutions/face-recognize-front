import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createDepartment } from '../api'

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}
