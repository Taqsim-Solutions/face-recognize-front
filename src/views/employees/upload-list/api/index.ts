import api from '@/api'
const url = '/api/employees'

import type { EmployeeSendListPayload, EmployeeSendListResponse } from '../types'
import type { AxiosResponse } from 'axios'

export const sendEmployeeList = async (
  payload: EmployeeSendListPayload[]
): Promise<AxiosResponse<EmployeeSendListResponse[]>> => {
  const res = await api.post(`${url}/list`, payload)
  return res
}
