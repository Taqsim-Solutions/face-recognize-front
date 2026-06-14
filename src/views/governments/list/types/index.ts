export type GovernmentModel = {
  id: number | string
  firstName: string
  lastName: string
  login: string
  email: string
  level: number
  regionId: number
  cityId: number
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

export type FetchGovernmentsParams = {
  size: number
  page: number
  search?: string
  orderBy?: string
  order?: 'asc' | 'desc'
  level?: number | null
  regionId?: number | null
  cityId?: number | null
  isRegion?: boolean | null
  entityStatus?: number | null
}

export type ApiError = {
  code?: string
  message?: string
  errors?: string[]
}

export type GovernmentModelIEnumerableResult = {
  isSuccess?: boolean
  error?: ApiError
  data?: GovernmentModel[]
  code?: number
  message?: string
  result?: {
    data: GovernmentModel[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
  }
}
