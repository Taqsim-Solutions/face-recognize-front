import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { getDepartment } from '../api'

export const useGetDepartment = (id: string | Ref<string>) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartment(typeof id === 'string' ? id : id.value),
    enabled: typeof id === 'string' ? !!id : !!id.value
  })
}
