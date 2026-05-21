import api from '@/api'

import type { AxiosResponse } from 'axios'
import type {
  FetchPaymentsParams,
  PayloadPayments,
  Payments,
  PaymentsModelIEnumerableResult
} from '../types'

const url = 'api/salary-payments'

export const fetchPayments = async (
  params: FetchPaymentsParams
): Promise<AxiosResponse<PaymentsModelIEnumerableResult>> => {
  return await api(url, { params })
}

export const createPayments = async (
  payload: PayloadPayments
): Promise<AxiosResponse<Payments>> => {
  return await api.post<Payments>(url, payload)
}
