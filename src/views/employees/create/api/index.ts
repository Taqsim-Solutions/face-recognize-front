import api from '@/api'
const url = 'api/employees'

import type { CreateEmployeeModel, EmployeeModelResult } from '../types'
import { AxiosResponse } from 'axios'

export const createEmployee = (
  payload: CreateEmployeeModel
): Promise<AxiosResponse<EmployeeModelResult>> => {
  return api.post(url, payload)
}
