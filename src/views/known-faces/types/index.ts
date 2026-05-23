export interface School {
  id: number
  name: string
  city: string | null
  region: string | null
}

export interface Region {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
  regionId: number
}

export interface Class {
  id: number
  degree: number
  symbol: string
  studyDays: string | null
}

export interface Teacher {
  id: number
  createdAt: string
  updatedAt: string | null
  firstName: string
  lastName: string
  login: string
  email: string
  level: number
  mainImageName: string
  imageNames: string[]
  school: School | null
  region: Region | null
  city: City | null
  class: Class | null
}

export interface Parent {
  id: number
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  phoneNumber: string
  passport: string
  gender: number
  workplace: string | null
  childId: number
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface Student {
  id: number
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  phoneNumber: string
  passport: string | null
  gender: number
  mainImageName: string
  imageIds: string[]
  classId: number
  className: string
  schoolId: number
  schoolName: string
  parents: Parent[]
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface KnownFace {
  id: number
  time: string
  imageName: string
  student: Student | null
  teacher: Teacher | null
}

export interface FetchKnownFacesParams {
  page?: number
  size?: number
  dateFrom?: string
  dateTo?: string
}

export interface FetchKnownFacesResponse {
  code: number
  message: string
  result: {
    data: KnownFace[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}
