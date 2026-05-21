import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addEmployeesToDepartment } from '../api'

export const useAddToDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ departmentId, employeeIds }: { departmentId: string; employeeIds: string[] }) =>
      addEmployeesToDepartment(departmentId, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}
