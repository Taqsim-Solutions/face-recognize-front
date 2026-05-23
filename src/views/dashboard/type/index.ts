export interface SchoolsNumberParams {
  regionId?: number
  cityId?: number
  schoolId?: number
  fromDate?: string
  toDate?: string
}

export interface SchoolsNumberResult {
  allSchoolsNumber: number
  connectedSchoolsNumber: number
  teachersCount: number
  absentTeachersCount: number
}

export interface SchoolsNumberResponse {
  code: number
  message: string
  result: SchoolsNumberResult
}

export interface PerformanceDay {
  date: string
  attendedCount: number
  notAttendedCount: number
}

export interface PerformanceResult {
  lastWeekPerformance: PerformanceDay[]
  thisWeekPerformance: PerformanceDay[]
}

export interface PerformanceResponse {
  code: number
  message: string
  result: PerformanceResult
}

export interface OverviewMonth {
  name: string
  percentage: string
}

export interface OverviewResult {
  overview: OverviewMonth[]
}

export interface OverviewResponse {
  code: number
  message: string
  result: OverviewResult
}

export interface SchoolDetailItem {
  id: number
  name: string
  totalStudents: number
  absentsCount: number
  boysCount: number
  girlsCount: number
  percentage: string
}

export interface SchoolDetailsParams {
  RegionId?: number
  CityId?: number
  PageIndex?: number
  ClassId?: number
  DateFrom?: string
  DateTo?: string
}

export interface SchoolDetailsResult {
  data: SchoolDetailItem[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface SchoolDetailsResponse {
  code: number
  message: string
  result: SchoolDetailsResult
}

export interface OverallStatisticsResult {
  totalStudents: number
  boysCount: number
  girlsCount: number
  absentsCount: number
}

export interface OverallStatisticsResponse {
  code: number
  message: string
  result: OverallStatisticsResult
}

export interface AbsentItem {
  id: number
  studentName?: string
  firstName?: string
  lastName?: string
  fatherName?: string
  schoolName?: string
  school?: string
  className?: string
  class?: string
  [key: string]: any
}

export interface AbsentsResult {
  data: AbsentItem[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface AbsentsResponse {
  code: number
  message: string
  result: AbsentsResult
}
