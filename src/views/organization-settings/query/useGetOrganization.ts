import { useQuery } from '@tanstack/vue-query'
import { getOrganization } from '../api'

export const useGetOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => getOrganization()
  })
}
