import api from '@/api'
import type { FetchKnownFacesParams, FetchKnownFacesResponse } from '../types'

const url = '/api/face-recognitons/face-images'

export const fetchKnownFaces = async (params: FetchKnownFacesParams) => {
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

  const response = await api.get<FetchKnownFacesResponse>(url, {
    params: mappedParams
  })
  return response.data
}
