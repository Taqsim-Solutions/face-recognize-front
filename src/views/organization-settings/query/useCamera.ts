import { useQuery } from '@tanstack/vue-query'
import { getCameras } from '../api'
import { unref } from 'vue'

export const useGetCameras = (params: any) => {
  return useQuery({
    queryKey: ['cameras', params],
    queryFn: () => getCameras(unref(params))
  })
}
