import { AxiosResponse } from 'axios'
import type {
  GetEmployeeByIdParams,
  GetEmployeeSalaryParams,
  GetEmployeeByIdResponse,
  GetEmployeeSalaryResponse,
  DeleteEmployeePayload,
  DeleteEmployeeResponse
} from '../types'

import api from '@/api'
const url = '/api/employees'

export const getEmployeeById = async ({
  id
}: GetEmployeeByIdParams): Promise<AxiosResponse<GetEmployeeByIdResponse>> => {
  const res = await api(`${url}/${id}`)
  return res
}

export const getEmployeeSalary = async ({
  id
}: GetEmployeeSalaryParams): Promise<AxiosResponse<GetEmployeeSalaryResponse>> => {
  const res = await api(`${url}/${id}/salary`)
  return res
}

export const deleteEmployee = async ({
  id
}: DeleteEmployeePayload): Promise<AxiosResponse<DeleteEmployeeResponse>> => {
  const res = await api.delete(`${url}/${id}`)
  return res
}
