export type ParentModel = {
  id?: number
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  phoneNumber: string
  passport?: string | null
  gender: number
  workplace?: string | null
  childId?: number
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export type StudentModel = {
  id: number
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  phoneNumber: string
  passport?: string | null
  gender: number
  mainImageName?: string | null
  imageIds?: string[]
  classId: number
  className?: string | null
  schoolId: number
  schoolName?: string | null
  parents?: ParentModel[]
  createdAt?: string
  updatedAt?: string | null
  isDeleted?: boolean
  region?: {
    id: number
    name: string
  } | null
  city?: {
    id: number
    name: string
  } | null
}

export type FetchStudentsParams = {
  size: number
  page: number
  search?: string
  regionId?: number | null
  cityId?: number | null
  schoolId?: number | null
  classId?: number | null
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type StudentModelIEnumerableResult = {
  isSuccess?: boolean
  error?: {
    code?: string
    message?: string
    errors?: string[]
  }
  code?: number
  message?: string
  result?: {
    data: StudentModel[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

export type CreateStudentPayload = {
  classId: number
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  phoneNumber: string
  gender: number
  mainImageName?: string | null
  imageIds?: string[]
  father?: {
    firstName: string
    lastName: string
    fatherName: string
    dateOfBirth: string
    phoneNumber: string
    passport: string
    workplace: string
  } | null
  mother?: {
    firstName: string
    lastName: string
    fatherName: string
    dateOfBirth: string
    phoneNumber: string
    passport: string
    workplace: string
  } | null
}

export type UpdateStudentPayload = CreateStudentPayload;
