import api from '@/api'
import type { FetchUnknownFacesParams, UnknownFacesResponse } from '../types'

const url = '/api/face-recognitons/unknown-faces'

export const fetchUnknownFaces = async (params: FetchUnknownFacesParams) => {
  const token = localStorage.getItem('token')
  if (token === 'fake-token') {
    throw new Error('Simulation Mode')
  }

  const { page, size, dateFrom, dateTo } = params
  const mappedParams: Record<string, any> = {}
  if (page !== undefined) mappedParams.PageIndex = page
  if (size !== undefined) mappedParams.PageSize = size
  if (dateFrom !== undefined && dateFrom !== '') mappedParams.DateFrom = dateFrom
  if (dateTo !== undefined && dateTo !== '') mappedParams.DateTo = dateTo

  const response = await api.get<{ code: number; message: string; result: UnknownFacesResponse }>(url, {
    params: mappedParams
  })
  return response.data
}

export const deleteUnknownFace = async (id: number) => {
  return await api.delete(`${url}/${id}`)
}
