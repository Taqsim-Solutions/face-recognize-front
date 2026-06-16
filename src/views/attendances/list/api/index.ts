import api from '@/api'

export const fetchAttendances = async (date: string) => {
  return await api.get<{ code: number; message: string; result: any[] }>(`/api/Attendances/date/${date}`)
}

export const fetchAttendanceRange = async (
  dateFrom: string,
  dateTo: string,
  schoolId?: number,
  cityId?: number,
  regionId?: number,
  classId?: number
) => {
  const params: Record<string, any> = { dateFrom, dateTo }
  if (schoolId !== undefined) params.schoolId = schoolId
  if (cityId   !== undefined) params.cityId   = cityId
  if (regionId !== undefined) params.regionId = regionId
  if (classId  !== undefined) params.classId  = classId
  return await api.get<{ code: number; message: string; result: any[] }>('/api/Attendances/range', { params })
}

export const fetchTeacherAttendanceRange = async (
  dateFrom: string,
  dateTo: string,
  schoolId?: number,
  cityId?: number,
  regionId?: number
) => {
  const params: Record<string, any> = { dateFrom, dateTo }
  if (schoolId !== undefined) params.schoolId = schoolId
  if (cityId   !== undefined) params.cityId   = cityId
  if (regionId !== undefined) params.regionId = regionId
  return await api.get<{ code: number; message: string; result: any[] }>(
    '/api/Attendances/teachers-range',
    { params }
  )
}

export const fetchClassStudentAttendances = async (date: string, classId: number) => {
  return await api.get<{ code: number; message: string; result: any[] }>(
    `/api/Attendances/date/${date}/class/${classId}`
  )
}

// All raw camera scans for one student / teacher on a given day (for the popup).
export const fetchStudentScans = async (studentId: number, date: string) => {
  return await api.get<{ code: number; message: string; result: any[] }>(
    `/api/Attendances/students/${studentId}/scans/${date}`
  )
}

export const fetchTeacherScans = async (teacherId: number, date: string) => {
  return await api.get<{ code: number; message: string; result: any[] }>(
    `/api/Attendances/teachers/${teacherId}/scans/${date}`
  )
}
