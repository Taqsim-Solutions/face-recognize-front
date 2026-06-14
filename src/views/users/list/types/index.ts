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
  entityStatus?: number | null
  departmentId?: string
  level?: number | null
}

export type EmployeeModelIEnumerableResult = {
  isSuccess?: boolean
  error?: ApiError
  data?: EmployeeModel[]
  code?: number
  message?: string
  result?: {
    data: EmployeeModel[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}
