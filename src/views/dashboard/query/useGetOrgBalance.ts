import { useQuery } from '@tanstack/vue-query'
import { fetchOrgBalance } from '../api'

interface OrgBalanceParams {
  fromDate: string | null
  toDate: string | null
}

export const useGetOrgBalance = (params: OrgBalanceParams) => {
  return useQuery({
    queryKey: ['org-balance', params],
    queryFn: () => fetchOrgBalance(params)
  })
}
