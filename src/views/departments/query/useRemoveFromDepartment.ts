import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { removeEmployeesFromDepartment } from '../api'

export const useRemoveFromDepartment = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, employeeIds }: { id: string, employeeIds: string[] }) => removeEmployeesFromDepartment(id, employeeIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['department-employees'] })
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        }
    })
}
