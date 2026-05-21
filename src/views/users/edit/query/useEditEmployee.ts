import type { EmployeeUpdatePayload } from '../types'

import { useMutation } from '@tanstack/vue-query'
import { updateEmployee } from '../api'

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeUpdatePayload }) =>
      updateEmployee({ id, payload })
  })
}
