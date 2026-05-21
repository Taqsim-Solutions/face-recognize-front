import { useQuery } from '@tanstack/vue-query'
import { fetchPaymentRequestsPerMonthStat } from '../api'

export const useGetPaymentRequestPerMonth = () => {
  return useQuery({
    queryKey: ['payment-request-per-month'],
    queryFn: () => fetchPaymentRequestsPerMonthStat()
  })
}
