import api from '@/api'

export const fetchCameras = async () => {
  return await api.get<any[]>('/api/Cameras')
}

export const createCamera = async (payload: any) => {
  return await api.post('/api/Cameras', payload)
}

export const updateCamera = async (id: number, payload: any) => {
  return await api.put(`/api/Cameras/${id}`, payload)
}

export const deleteCamera = async (id: number) => {
  return await api.delete(`/api/Cameras/${id}`)
}

export const resyncSchool = async (id: number) => {
  return await api.post(`/api/Cameras/${id}/resync-school`)
}

// Push every student & teacher (with photo) of all schools to their cameras
export const syncAllCameras = async () => {
  return await api.post('/api/Cameras/sync-all')
}

// Preview what a full sync would push (counts)
export const fetchSyncPreview = async () => {
  return await api.get<{ code: number; message: string; result: any }>('/api/Cameras/sync-preview')
}

// Push one school's students & teachers (with photo) to its cameras
export const syncSchoolCameras = async (schoolId: number) => {
  return await api.post(`/api/Cameras/sync-school/${schoolId}`)
}

// Read users currently stored on a camera (import preview)
export const fetchCameraUsers = async (cameraId: number) => {
  return await api.get<any[]>(`/api/Cameras/${cameraId}/users`)
}

// Import confirmed camera users into the system
export const importCameraUsers = async (payload: {
  cameraId: number
  users: Array<{
    employeeNo: string
    firstName: string
    lastName: string
    fatherName?: string
    kind: number // 1 = Student, 2 = Teacher
    gender: number
    classId?: number | null
    schoolId?: number | null
  }>
}) => {
  return await api.post('/api/Cameras/import', payload)
}

// Classes for a school (used in import: assign student to a class)
export const fetchClassesBySchool = async (schoolId: number) => {
  return await api.get<{ code: number; message: string; result: any }>('/api/classes', {
    params: { SchoolId: schoolId, PageSize: 999 }
  })
}

// Admin: delete all empty classes (no students, no teacher) across the system.
export const cleanupEmptyClasses = async () => {
  return await api.delete<{ code: number; message: string; result: { removed: number } }>(
    '/api/classes/cleanup-empty'
  )
}

// ── Rest periods (days off / holidays / summer break) ───────────────
export const fetchRestPeriods = async () => {
  return await api.get<{ code: number; message: string; result: any }>('/api/rest-periods', {
    params: { PageSize: 999, PageIndex: 1 }
  })
}

export const createRestPeriod = async (payload: {
  dateFrom: string
  dateTo: string
  name: string
  comment?: string
}) => {
  return await api.post('/api/rest-periods', payload)
}

export const updateRestPeriod = async (id: number, payload: {
  dateFrom: string
  dateTo: string
  name: string
  comment?: string
}) => {
  return await api.put(`/api/rest-periods/${id}`, payload)
}

export const deleteRestPeriod = async (id: number) => {
  return await api.delete(`/api/rest-periods/${id}`)
}

// ── Start-time settings (global / school / class cascade) ──────────
export interface StartTimeInfo {
  global: string | null
  school?: string | null
  school2?: string | null
  class?: string | null
  shift?: number | null
  effective: string | null
}

export const fetchGlobalStartTime = async () => {
  return await api.get<{ code: number; message: string; result: string | null }>(
    '/api/settings/start-time/global'
  )
}

export const setGlobalStartTime = async (startTime: string | null) => {
  return await api.put('/api/settings/start-time/global', { startTime })
}

export const fetchSchoolStartTime = async (schoolId: number) => {
  return await api.get<{ code: number; message: string; result: StartTimeInfo }>(
    `/api/settings/start-time/school/${schoolId}`
  )
}

export const setSchoolStartTime = async (
  schoolId: number,
  startTime: string | null,
  startTime2: string | null
) => {
  return await api.put(`/api/settings/start-time/school/${schoolId}`, { startTime, startTime2 })
}

export const fetchClassStartTime = async (classId: number) => {
  return await api.get<{ code: number; message: string; result: StartTimeInfo }>(
    `/api/settings/start-time/class/${classId}`
  )
}

export const setClassStartTime = async (
  classId: number,
  startTime: string | null,
  shift: number | null
) => {
  return await api.put(`/api/settings/start-time/class/${classId}`, { startTime, shift })
}
