import api from '@/api'
const url = '/api/employees'


import type { FetchEmployeesParams, EmployeeModelIEnumerableResult } from '../types'

export const fetchEmployees = async (params: FetchEmployeesParams) => {
  return await api<EmployeeModelIEnumerableResult>(url, { params })
}

export const bulkUpdateStatus = async (data: { employeeIds: string[]; status: string }) => {
  return await api.patch(`${url}/bulk/status`, data)
}

export const bulkUpdatePercentAllowed = async (data: {
  employeeIds: string[]
  percentAllowed: number
}) => {
  return await api.patch(`${url}/bulk/percent-allowed`, data)
}
