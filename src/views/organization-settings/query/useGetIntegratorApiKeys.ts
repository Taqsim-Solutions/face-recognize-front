import { useQuery } from '@tanstack/vue-query'
import { getIntegratorApiKeys } from '../api'
import type { IntegratorApiKeysResponse } from '../types'

export const useGetIntegratorApiKeys = () => {
  return useQuery<IntegratorApiKeysResponse>({
    queryKey: ['integrator-api-keys'],
    queryFn: async () => {
      const res = await getIntegratorApiKeys()
      return res.data
    }
  })
}
