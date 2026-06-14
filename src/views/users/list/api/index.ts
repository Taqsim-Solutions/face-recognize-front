import api from '@/api'
const url = '/api/users'


import type { FetchEmployeesParams, EmployeeModelIEnumerableResult } from '../types'

export const fetchEmployees = async (params: FetchEmployeesParams) => {
  const { page, size, search, entityStatus, ...rest } = params
  const mappedParams: Record<string, any> = {
    ...rest
  }
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined) mappedParams.Search = search
  // New EntityStatus lifecycle filter -> backend GetUsersFilter.Status (int)
  if (entityStatus !== undefined && entityStatus !== null) mappedParams.Status = entityStatus

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

// PATCH /api/users/{id}/status?status=1|2|3 (new EntityStatus lifecycle)
export const changeUserStatus = async (id: string | number, status: number) => {
  return await api.patch(`${url}/${id}/status`, null, { params: { status } })
}

export const getUserById = async (id: string) => {
  const res = await api.get(`${url}/${id}`)
  return res.data
}

export const updateEmployee = async ({ id, payload }: { id: string; payload: any }) => {
  return await api.put(`${url}/${id}`, payload)
}

export const updatePassword = async ({ id, newPassword }: { id: string | number; newPassword: string }) => {
  return await api.put(`/api/users/password/${id}`, null, {
    params: {
      newPassword
    }
  })
}

