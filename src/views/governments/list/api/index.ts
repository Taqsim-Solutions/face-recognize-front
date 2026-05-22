import api from '@/api'
import type { FetchGovernmentsParams, GovernmentModelIEnumerableResult, RegionModel } from '../types'

const url = '/api/governments'

export const fetchGovernments = async (params: FetchGovernmentsParams) => {
  const { page, size, search, isRegion, ...rest } = params
  const mappedParams: Record<string, any> = {
    ...rest
  }
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (search !== undefined) mappedParams.Search = search
  if (isRegion !== undefined && isRegion !== null) {
    mappedParams.IsRegion = isRegion
  }

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

export const fetchRegions = async () => {
  return await api.get<{ code: number; message: string; result: RegionModel[] }>('/api/regions')
}
