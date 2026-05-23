import api from '@/api'

const url = '/api/Attendances'

export const fetchAttendancesByDate = async (date: string) => {
  return await api.get(`${url}/date/${date}`)
}
