import api from '@/api'
import type { FetchSchoolsParams, SchoolModelIEnumerableResult, RegionModel } from '../types'

const url = '/api/schools'

export const fetchSchools = async (params: FetchSchoolsParams) => {
  const { page, size, search, ...rest } = params
  const mappedParams: Record<string, any> = { ...rest }
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined) mappedParams.Name = search

  return await api<SchoolModelIEnumerableResult>(url, { params: mappedParams })
}

export const createSchool = async (payload: { name: string; cityId: number }) => {
  return await api.post(url, payload)
}

export const updateSchool = async ({ id, payload }: { id: string | number; payload: { name: string; cityId: number } }) => {
  return await api.put(`${url}/${id}`, payload)
}

export const deleteSchool = async (id: string | number) => {
  return await api.delete(`${url}/${id}`)
}

// PATCH /api/schools/{id}/status?status=1|2|3
export const changeSchoolStatus = async (id: string | number, status: number) => {
  return await api.patch(`${url}/${id}/status`, null, { params: { status } })
}

export const bulkChangeSchoolStatus = async (ids: (string | number)[], status: number) => {
  return await api.patch(`${url}/bulk/status`, { ids, status })
}

export const updateSchoolDirector = async ({ id, directorId }: { id: string | number; directorId: number }) => {
  return await api.put(`${url}/${id}/director`, { directorId })
}

export const fetchRegions = async () => {
  return await api.get<{ code: number; message: string; result: RegionModel[] }>('/api/regions')
}

export const fetchDirectors = async () => {
  // Fetch users with director role (level=2), PageSize 999
  return await api.get('/api/users', { params: { Level: 2, PageSize: 999 } })
}
