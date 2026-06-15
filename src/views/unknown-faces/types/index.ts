export interface UnknownFace {
  id: number
  imageName: string
  createdAt: string
  cameraId?: number | null
  cameraName?: string | null
  schoolId?: number | null
  schoolName?: string | null
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
