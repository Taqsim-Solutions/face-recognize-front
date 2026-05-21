import type { ApiError, EmployeeModel } from '../../types'

export type FetchEmployeesParams = {
  organizationId?: string
  fromCreatedAt?: string
  toCreatedAt?: string
  userId?: number
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
  search?: string
  status?: string | null
  departmentId?: string
}

export type EmployeeModelIEnumerableResult = {
  isSuccess: boolean
  error: ApiError
  data?: EmployeeModel[]
}
