import { useMutation } from '@tanstack/vue-query'
import { sendEmployeeList } from '../api'
import type { EmployeeSendListPayload } from '../types'

export const useSendEmployeeList = () => {
  return useMutation({
    mutationFn: (data: EmployeeSendListPayload[]) => sendEmployeeList(data)
  })
}
