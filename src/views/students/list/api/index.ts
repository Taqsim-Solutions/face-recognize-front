import api from '@/api'
import type {
  FetchStudentsParams,
  StudentModelIEnumerableResult,
  CreateStudentPayload,
  UpdateStudentPayload
} from '../types'

const url = '/api/students'

export const fetchStudents = async (params: FetchStudentsParams) => {
  const { page, size, search, regionId, cityId, schoolId, classId, orderBy, order } = params
  const mappedParams: Record<string, any> = {}

  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined && search !== '') mappedParams.Search = search
  if (regionId) mappedParams.RegionId = regionId
  if (cityId) mappedParams.CityId = cityId
  if (schoolId) mappedParams.SchoolId = schoolId
  if (classId) mappedParams.ClassId = classId
  if (orderBy) mappedParams.OrderBy = orderBy
  if (order) mappedParams.Order = order

  return await api<StudentModelIEnumerableResult>(url, { params: mappedParams })
}

export const fetchClassesBySchool = async (schoolId: number) => {
  return await api.get<{ code: number; message: string; result: any }>('/api/classes', {
    params: {
      SchoolId: schoolId,
      PageSize: 999
    }
  })
}

export const createStudent = async (payload: CreateStudentPayload) => {
  return await api.post<{ code: number; message: string; result: any }>(url, payload)
}

export const updateStudent = async ({
  id,
  payload
}: {
  id: number | string
  payload: UpdateStudentPayload
}) => {
  return await api.put(`${url}/${id}`, payload)
}

export const deleteStudent = async (id: number | string) => {
  return await api.delete(`${url}/${id}`)
}

export const uploadStudentPhoto = async (imageName: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return await api.put(`/api/students/photo/${imageName}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// POST /api/students/{id}/photo — upload photo by student ID
export const postStudentPhoto = async (studentId: number | string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return await api.post(`${url}/${studentId}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deleteStudentPhoto = async (imageName: string) => {
  return await api.delete(`/api/students/photo/${imageName}`)
}

export const setMainPhoto = async (id: number | string, mainPhotoName: string) => {
  return await api.put(`/api/students/${id}/photo/main`, null, {
    params: {
      mainPhotoName
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

export const downloadExcelExample = async () => {
  const response = await api.get('/api/students/excel-example', {
    responseType: 'blob'
  })
  return response.data
}

export const exportStudentsExcel = async (params: Partial<FetchStudentsParams>) => {
  const mappedParams: Record<string, any> = {}
  if (params.search) mappedParams.Search = params.search
  if (params.regionId) mappedParams.RegionId = params.regionId
  if (params.cityId) mappedParams.CityId = params.cityId
  if (params.schoolId) mappedParams.SchoolId = params.schoolId
  if (params.classId) mappedParams.ClassId = params.classId
  const response = await api.get('/api/students/export-excel', {
    params: mappedParams,
    responseType: 'blob'
  })
  return response.data
}

export const uploadExcelFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await api.post('/api/students/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
