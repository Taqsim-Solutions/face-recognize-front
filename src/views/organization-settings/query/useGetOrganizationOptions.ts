import { useQuery } from '@tanstack/vue-query'
import { getOrganizationOptions } from '../api'

export const useGetOrganizationOptions = () => {
  return useQuery({
    queryKey: ['organization-options'],
    queryFn: () => getOrganizationOptions()
  })
}
