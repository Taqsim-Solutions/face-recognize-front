import api from '@/api'
const url = '/api/users'


import type { FetchEmployeesParams, EmployeeModelIEnumerableResult } from '../types'

export const fetchEmployees = async (params: FetchEmployeesParams) => {
  const { page, size, search, ...rest } = params
  const mappedParams: Record<string, any> = {
    ...rest
  }
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined) mappedParams.Search = search

  return await api<EmployeeModelIEnumerableResult>(url, { params: mappedParams })
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

export const deleteEmployee = async (id: string) => {
  return await api.delete(`${url}/${id}`)
}

export const getUserById = async (id: string) => {
  const res = await api.get(`${url}/${id}`)
  return res.data
}

export const updateEmployee = async ({ id, payload }: { id: string; payload: any }) => {
  return await api.put(`${url}/${id}`, payload)
}
