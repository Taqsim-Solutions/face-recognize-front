import api from '@/api'
import type { FetchGovernmentsParams, GovernmentModelIEnumerableResult, RegionModel } from '../types'

const url = '/api/governments'

export const fetchGovernments = async (params: FetchGovernmentsParams) => {
  const { page, size, search, isRegion, entityStatus, ...rest } = params
  const mappedParams: Record<string, any> = {
    ...rest
  }
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined) mappedParams.Search = search
  if (isRegion !== undefined && isRegion !== null) {
    mappedParams.IsRegion = isRegion
  }
  if (entityStatus !== undefined && entityStatus !== null) mappedParams.Status = entityStatus

  return await api<GovernmentModelIEnumerableResult>(url, { params: mappedParams })
}

export const createGovernment = async (payload: any) => {
  return await api.post(url, payload)
}

export const updateGovernment = async ({ id, payload }: { id: string | number; payload: any }) => {
  return await api.put(`${url}/${id}`, payload)
}

export const deleteGovernment = async (id: string | number) => {
  return await api.delete(`${url}/${id}`)
}

// Government rows are users (Level3/4); reuse the user status endpoint.
export const changeGovernmentStatus = async (id: string | number, status: number) => {
  return await api.patch(`/api/users/${id}/status`, null, { params: { status } })
}

// Governments are users; reuse the users bulk endpoint.
export const bulkChangeGovernmentStatus = async (ids: (string | number)[], status: number) => {
  return await api.patch(`/api/users/bulk/status`, { ids, status })
}

export const updateGovernmentPassword = async ({
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

export const fetchRegions = async () => {
  return await api.get<{ code: number; message: string; result: RegionModel[] }>('/api/regions')
}
