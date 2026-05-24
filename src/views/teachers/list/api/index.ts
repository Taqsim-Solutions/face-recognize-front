import api from '@/api'
import type {
  FetchTeachersParams,
  TeacherModelIEnumerableResult,
  CreateTeacherPayload,
  UpdateTeacherPayload
} from '../types'

const url = '/api/teachers'

export const fetchTeachers = async (params: FetchTeachersParams) => {
  const { page, size, SearchText, regionId, cityId, schoolId, classId, orderBy, order } = params
  const mappedParams: Record<string, any> = {}

  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (SearchText !== undefined && SearchText !== '') mappedParams.SearchText = SearchText
  if (regionId) mappedParams.RegionId = regionId
  if (cityId) mappedParams.CityId = cityId
  if (schoolId) mappedParams.SchoolId = schoolId
  if (classId) mappedParams.ClassId = classId
  if (orderBy) mappedParams.OrderBy = orderBy
  if (order) mappedParams.Order = order

  return await api<TeacherModelIEnumerableResult>(url, { params: mappedParams })
}

export const fetchClassesBySchool = async (schoolId: number) => {
  return await api.get<{ code: number; message: string; result: any }>('/api/classes', {
    params: {
      SchoolId: schoolId,
      PageSize: 999
    }
  })
}

export const createTeacher = async (payload: CreateTeacherPayload) => {
  return await api.post<{ code: number; message: string; result: any }>(url, payload)
}

export const updateTeacher = async ({
  id,
  payload
}: {
  id: number | string
  payload: UpdateTeacherPayload
}) => {
  return await api.put(`${url}/${id}`, payload)
}

export const deleteTeacher = async (id: number | string) => {
  return await api.delete(`${url}/${id}`)
}

export const updateTeacherPassword = async ({
  id,
  newPassword
}: {
  id: number | string
  newPassword: string
}) => {
  return await api.put(`/api/users/password/${id}`, null, {
    params: {
      newPassword
    }
  })
}

export const uploadTeacherPhoto = async (id: number | string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return await api.post(`/api/users/photo/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Cascade API calls
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

export const fetchAllSchools = async () => {
  return await api.get<{ code: number; message: string; result: { data: any[] } }>('/api/schools', {
    params: {
      PageSize: 999
    }
  })
}

export const downloadExcelExample = async () => {
  const response = await api.get('/api/teachers/excel-example', {
    responseType: 'blob'
  })
  return response.data
}

export const uploadExcelFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await api.post('/api/teachers/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
