import { useQuery } from '@tanstack/vue-query'
import { fetchPaymentRequestsStat } from '../api'

export const useGetPaymentRequestsStat = () => {
  return useQuery({
    queryKey: ['payment-requests-stat'],
    queryFn: () => fetchPaymentRequestsStat()
  })
}
