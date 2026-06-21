import api from '@/api'

const url = '/api/excused-absences'

export interface ExcusedAbsence {
  id: number
  studentId: number
  studentName: string
  className: string
  dateFrom: string
  dateTo: string
  reason: number
  reasonName: string
  comment: string | null
  approvalStatus: number
  approvalStatusName: string
  fromParent: boolean
  createdAt: string
}

export const fetchExcusedAbsences = async (classId?: number, pendingOnly = false) => {
  const params: Record<string, any> = {}
  if (classId) params.classId = classId
  if (pendingOnly) params.pendingOnly = true
  return await api<{ result: ExcusedAbsence[] }>(url, { params })
}

export const createExcusedAbsence = async (payload: {
  studentId: number
  dateFrom: string
  dateTo: string
  reason: number
  comment?: string
}) => {
  return await api.post(url, payload)
}

export const updateExcusedAbsence = async (
  id: number,
  payload: { dateFrom: string; dateTo: string; reason: number; comment?: string }
) => {
  return await api.put(`${url}/${id}`, payload)
}

export const deleteExcusedAbsence = async (id: number) => {
  return await api.delete(`${url}/${id}`)
}

export const approveExcusedAbsence = async (id: number) => {
  return await api.post(`${url}/${id}/approve`)
}

export const rejectExcusedAbsence = async (id: number) => {
  return await api.post(`${url}/${id}/reject`)
}
