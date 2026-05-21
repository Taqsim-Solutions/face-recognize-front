import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { deleteDepartment } from '../api'

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}
