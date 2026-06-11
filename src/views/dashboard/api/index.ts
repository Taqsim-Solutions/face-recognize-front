import api from '@/api'
import type {
  SchoolsNumberParams,
  SchoolsNumberResponse,
  PerformanceResponse,
  OverviewResponse,
  SchoolDetailsParams,
  SchoolDetailsResponse,
  OverallStatisticsResponse,
  AbsentsResponse
} from '../type'

const url = '/api/dashboard/schools-number'

export const fetchSchoolsNumber = async (params: SchoolsNumberParams) => {
  const { regionId, cityId, schoolId, fromDate, toDate } = params
  const mappedParams: Record<string, any> = {}

  if (regionId) mappedParams.RegionId = regionId
  if (cityId) mappedParams.CityId = cityId
  if (schoolId) mappedParams.SchoolId = schoolId
  if (fromDate) mappedParams.FromDate = fromDate
  if (toDate) mappedParams.ToDate = toDate

  return await api.get<SchoolsNumberResponse>(url, { params: mappedParams })
}

// Cascade API calls for filters
export const fetchRegions = async () => {
  return await api.get<{ code: number; message: string; result: any[] }>('/api/regions')
}

export const fetchSchoolsByCity = async (cityId: number) => {
  return await api.get<{ code: number; message: string; result: { data: any[] } }>('/api/schools', {
    params: {
      CityId: cityId,
      PageSize: 999
    }
  })
}

// Performance and Overview Dashboard stats
export const fetchWeeklyPerformance = async (params: { RegionId?: number; CityId?: number }) => {
  const mappedParams: Record<string, any> = {}
  if (params.RegionId) mappedParams.RegionId = params.RegionId
  if (params.CityId) mappedParams.CityId = params.CityId
  return await api.get<PerformanceResponse>('/api/dashboard/performance', { params: mappedParams })
}

export const fetchMonthlyOverview = async (params: { RegionId?: number; CityId?: number }) => {
  const mappedParams: Record<string, any> = {}
  if (params.RegionId) mappedParams.RegionId = params.RegionId
  if (params.CityId) mappedParams.CityId = params.CityId
  return await api.get<OverviewResponse>('/api/dashboard/overview', { params: mappedParams })
}

export const fetchSchoolDetails = async (params: SchoolDetailsParams) => {
  const mappedParams: Record<string, any> = {}
  if (params.RegionId) mappedParams.RegionId = params.RegionId
  if (params.CityId) mappedParams.CityId = params.CityId
  if (params.PageIndex) mappedParams.PageIndex = params.PageIndex
  if (params.ClassId) mappedParams.ClassId = params.ClassId
  if (params.DateFrom) mappedParams.DateFrom = params.DateFrom
  if (params.DateTo) mappedParams.DateTo = params.DateTo
  mappedParams.PageSize = 10 // Limit page size to 10 as shown in mockup
  return await api.get<SchoolDetailsResponse>('/api/dashboard/school-details', { params: mappedParams })
}

export const fetchOverallStatistics = async (params: {
  RegionId?: number
  CityId?: number
  SchoolId?: number
  ClassId?: number
  DateFrom?: string
  DateTo?: string
}) => {
  const mappedParams: Record<string, any> = {}
  if (params.RegionId) mappedParams.RegionId = params.RegionId
  if (params.CityId) mappedParams.CityId = params.CityId
  if (params.SchoolId) mappedParams.SchoolId = params.SchoolId
  if (params.ClassId) mappedParams.ClassId = params.ClassId
  if (params.DateFrom) mappedParams.DateFrom = params.DateFrom
  if (params.DateTo) mappedParams.DateTo = params.DateTo
  return await api.get<OverallStatisticsResponse>('/api/dashboard/overall-statistics', {
    params: mappedParams
  })
}

export const fetchAbsents = async (params: {
  RegionId?: number
  CityId?: number
  SchoolId?: number
  ClassId?: number
  DateFrom?: string
  DateTo?: string
  PageIndex?: number
  isDescending?: boolean
}) => {
  const mappedParams: Record<string, any> = {}
  if (params.RegionId) mappedParams.RegionId = params.RegionId
  if (params.CityId) mappedParams.CityId = params.CityId
  if (params.SchoolId) mappedParams.SchoolId = params.SchoolId
  if (params.ClassId) mappedParams.ClassId = params.ClassId
  if (params.DateFrom) mappedParams.DateFrom = params.DateFrom
  if (params.DateTo) mappedParams.DateTo = params.DateTo
  if (params.PageIndex) mappedParams.PageIndex = params.PageIndex
  mappedParams.isDescending = params.isDescending ?? false
  mappedParams.PageSize = 4 // Limit page size to 4 rows as shown in mockup
  return await api.get<AbsentsResponse>('/api/dashboard/absents', { params: mappedParams })
}

export const fetchLateStudents = async (params: {
  dateFrom?: string
  dateTo?: string
  schoolId?: number
  cityId?: number
  regionId?: number
  classId?: number
  pageIndex?: number
  pageSize?: number
}) => {
  const p: Record<string, any> = {}
  if (params.dateFrom) p.DateFrom = params.dateFrom
  if (params.dateTo) p.DateTo = params.dateTo
  if (params.schoolId) p.SchoolId = params.schoolId
  if (params.cityId) p.CityId = params.cityId
  if (params.regionId) p.RegionId = params.regionId
  if (params.classId) p.ClassId = params.classId
  p.PageIndex = params.pageIndex || 1
  p.PageSize = params.pageSize || 20
  return await api.get('/api/dashboard/late-students', { params: p })
}

// Cameras whose last sync to the device failed (connection problems).
export const fetchCameraAlerts = async () => {
  return await api.get('/api/dashboard/camera-alerts')
}
