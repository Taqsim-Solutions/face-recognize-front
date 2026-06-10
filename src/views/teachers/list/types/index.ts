export type TeacherModel = {
  id: number
  firstName: string
  lastName: string
  email?: string
  login?: string
  level?: number
  isTeacher?: boolean
  schoolId?: number | null
  schoolName?: string | null
  mainImageName?: string | null
  imageIds?: string[]
  region?: {
    id: number
    name: string
    cities?: {
      id: number
      name: string
      regionId: number
    }[]
  } | null
  city?: {
    id: number
    name: string
    regionId: number
  } | null
  createdAt?: string
  updatedAt?: string | null
  isDeleted?: boolean
  class?: {
    id: number
    degree: number | string
    symbol: string
    studyDays?: any
  } | null
}

export type FetchTeachersParams = {
  size: number
  page: number
  SearchText?: string
  regionId?: number | null
  cityId?: number | null
  schoolId?: number | null
  classId?: number | null
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
  email?: string
  login: string
  password?: string
  isDirectorOrAssistandDirector: boolean
  schoolId: number
  classId: number | null
  isTeacher: boolean
}

export type UpdateTeacherPayload = {
  firstName: string
  lastName: string
  email?: string
  login: string
  isDirectorOrAssistandDirector: boolean
  schoolId: number
  classId: number | null
  isTeacher: boolean
}
