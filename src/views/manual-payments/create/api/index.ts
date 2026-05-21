import type { CreateManualPayment } from '../types'

import api from '@/api'
const url = '/api/manual-payments'

export const sendPaymentsList = async (payload: CreateManualPayment) => {
  return await api.post(url, payload)
}
