export type TeacherModel = {
  id: number
  firstName: string
  lastName: string
  email: string
  login?: string
  level?: number
  schoolId?: number | null
  schoolName?: string | null
  photoUrl?: string | null
  class?: {
    id: number
    degree: number | string
    symbol: string
  } | null
}

export type FetchTeachersParams = {
  size: number
  page: number
  search?: string
  regionId?: number | null
  cityId?: number | null
  schoolId?: number | null
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type ApiError = {
  code?: string
  message?: string
  errors?: string[]
}

export type TeacherModelIEnumerableResult = {
  isSuccess?: boolean
  error?: ApiError
  code?: number
  message?: string
  result?: {
    data: TeacherModel[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

export type CreateTeacherPayload = {
  firstName: string
  lastName: string
  email: string
  login: string
  password?: string
  isDirectorOrAssistandDirector: boolean
  schoolId: number
  classId: number
}

export type UpdateTeacherPayload = {
  firstName: string
  lastName: string
  email: string
  login: string
  isDirectorOrAssistandDirector: boolean
  schoolId: number
  classId: number
}
