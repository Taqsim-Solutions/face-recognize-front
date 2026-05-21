import api from '@/api'
const url = '/api/attendances'

import type { AttendancesFetchParams, AttendanceFetchResponse } from '../types'
import type { AxiosResponse } from 'axios'

export const fetchAttendances = async (
  params: AttendancesFetchParams
): Promise<AxiosResponse<AttendanceFetchResponse[]>> => {
  const response = await api(url, { params })
  return {
    ...response,
    data: response.data.data
  }
}
