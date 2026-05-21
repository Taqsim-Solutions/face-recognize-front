import { useMutation } from '@tanstack/vue-query'
import { bulkUpdateStatus } from '../api'

export const useBulkUpdateStatus = () => {
    return useMutation({
        mutationFn: (data: { employeeIds: string[]; status: string }) => bulkUpdateStatus(data)
    })
}
