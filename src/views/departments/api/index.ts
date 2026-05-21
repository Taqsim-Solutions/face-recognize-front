import api from '@/api'
import type {
  DepartmentsListResponse,
  DepartmentResponse,
  GetDepartmentsParams,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../types'

const url = '/api/departments'

export const getDepartments = async (params?: GetDepartmentsParams) => {
  return await api.get<DepartmentsListResponse>(url, { params })
}

export const getDepartment = async (id: string) => {
  return await api.get<DepartmentResponse>(`${url}/${id}`)
}

export const createDepartment = async (data: CreateDepartmentRequest) => {
  return await api.post<DepartmentResponse>(url, data)
}

export const updateDepartment = async (id: string, data: UpdateDepartmentRequest) => {
  return await api.put<DepartmentResponse>(`${url}/${id}`, data)
}

export const deleteDepartment = async (id: string) => {
  return await api.delete(`${url}/${id}`)
}

export const addEmployeesToDepartment = async (id: string, employeeIds: string[]) => {
  return await api.post(`${url}/${id}/employees`, employeeIds)
}


export const removeEmployeesFromDepartment = async (id: string, employeeIds: string[]) => {
  return await api.delete(`${url}/${id}/employees`, { data: employeeIds })
}
