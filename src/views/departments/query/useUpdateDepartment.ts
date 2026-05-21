import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateDepartment } from '../api'
import type { UpdateDepartmentRequest } from '../types'

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}
