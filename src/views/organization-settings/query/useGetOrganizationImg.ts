import type { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getOrganizationImg } from '../api'

export const useGetOrganizationImg = (id: string, enabled: ComputedRef<boolean>) => {
  console.log(id)
  return useQuery({
    queryKey: ['organization-img', id],
    queryFn: () => getOrganizationImg(id),
    enabled: enabled.value
  })
}
