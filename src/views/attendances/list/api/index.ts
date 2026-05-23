import api from '@/api'

export const fetchAttendances = async (date: string) => {
  return await api.get<{ code: number; message: string; result: any[] }>(`/api/Attendances/date/${date}`)
}
