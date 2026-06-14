export type SchoolModel = {
  id: number | string
  name: string
  cityId: number
  city?: {
    id: number
    name: string
    regionId: number
  }
  region?: {
    id: number
    name: string
    cities: { id: number; name: string; regionId: number }[]
  }
  directorId: number
  directorFullName: string | null
  lastConnectionTime: string | null
  createdAt: string
  updatedAt: string | null
  isDeleted: boolean
  status?: number | null
}

export type CityModel = {
  id: number
  name: string
  regionId: number
}

export type RegionModel = {
  id: number
  name: string
  cities: CityModel[]
}

export type FetchSchoolsParams = {
  size: number
  page: number
  search?: string
  orderBy?: string
  order?: 'asc' | 'desc'
  regionId?: number | null
  cityId?: number | null
  status?: number | null
}

export type ApiError = {
  code?: string
  message?: string
  errors?: string[]
}

export type SchoolModelIEnumerableResult = {
  isSuccess?: boolean
  error?: ApiError
  data?: SchoolModel[]
  code?: number
  message?: string
  result?: {
    data: SchoolModel[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}
