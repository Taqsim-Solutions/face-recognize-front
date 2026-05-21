import { useQuery } from '@tanstack/vue-query'
import { getOrganizationLeaveOptions } from '../api'

export const useGetOrganizationLeaveOptions = () => {
  return useQuery({
    queryKey: ['organization-leave-options'],
    queryFn: () => getOrganizationLeaveOptions()
  })
}
