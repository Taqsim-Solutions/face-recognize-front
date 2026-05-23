import { useQuery } from '@tanstack/vue-query'
import { fetchSchoolDetails } from '../api'
import type { MaybeRefOrGetter } from 'vue'
import type { SchoolDetailsParams } from '../type'

export const useGetSchoolDetails = (params: MaybeRefOrGetter<SchoolDetailsParams>) => {
  return useQuery({
    queryKey: ['school-details', params],
    queryFn: async () => {
      const resolvedParams = typeof params === 'function' ? params() : 'value' in params ? params.value : params
      const res = await fetchSchoolDetails(resolvedParams)
      return res.data.result
    },
    staleTime: 10000,
    gcTime: 30000
  })
}
