export interface UnknownFace {
  id: number
  imageName: string
  createdAt: string
}

export interface FetchUnknownFacesParams {
  page?: number
  size?: number
  dateFrom?: string
  dateTo?: string
  regionId?: number
  cityId?: number
  schoolId?: number
}

export interface UnknownFacesResponse {
  data: UnknownFace[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}
