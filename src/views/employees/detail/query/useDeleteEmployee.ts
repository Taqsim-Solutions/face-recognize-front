import type { DeleteEmployeePayload } from '../types'

import { useMutation } from '@tanstack/vue-query'
import { deleteEmployee } from '../api'

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: (payload: DeleteEmployeePayload) => deleteEmployee(payload)
  })
}
