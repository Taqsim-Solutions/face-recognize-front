import type { Error } from '@/global-types'

export interface Department {
  id: string
  name: string
}

export interface DepartmentsListResponse {
  isSuccess: boolean
  error: Error
  data: Department[]
}

export interface DepartmentResponse {
  isSuccess: boolean
  error: Error
  data: Department
}

export interface GetDepartmentsParams {
  organizationId?: string
  containsName?: string
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface CreateDepartmentRequest {
  name: string
}

export interface UpdateDepartmentRequest {
  name: string
}
