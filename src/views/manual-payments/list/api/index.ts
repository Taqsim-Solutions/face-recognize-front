import type { FetchManualPaymentsParams } from '../types'

import api from '@/api'
const url = 'api/manual-payments'

export const fetchManualPayments = async (params: FetchManualPaymentsParams) => {
  return await api(url, { params })
}
