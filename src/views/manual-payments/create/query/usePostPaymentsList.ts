import { useMutation } from '@tanstack/vue-query'
import { sendPaymentsList } from '../api'

import type { CreateManualPayment } from '../types'

export const usePostPaymentsList = () => {
  return useMutation({
    mutationFn: (data: CreateManualPayment) => sendPaymentsList(data)
  })
}
