import { useMutation } from '@tanstack/vue-query'
import { bulkUpdatePercentAllowed } from '../api'

export const useBulkUpdatePercentAllowed = () => {
    return useMutation({
        mutationFn: (data: { employeeIds: string[]; percentAllowed: number }) =>
            bulkUpdatePercentAllowed(data)
    })
}
