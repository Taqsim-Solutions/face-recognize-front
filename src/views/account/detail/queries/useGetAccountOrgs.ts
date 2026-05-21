import { useQuery } from '@tanstack/vue-query'
import { getAccountOrgs } from '../api'
import globalRouter from '@/router'
import { toast } from 'vue-sonner'

export const useGetAccountOrgs = () => {
  return useQuery({
    queryKey: ['account-organizations'],
    queryFn: async () => {
      try {
        return await getAccountOrgs()
      } catch (error: any) {
        if (error?.response?.status === 403) {
          handleForbidden()
        }
        throw error
      }
    },
    select: (data) => data.data.data,
    staleTime: 600000,
    gcTime: Infinity,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

function handleForbidden() {
  toast.error("Sizda ushbu tizimga kirish huquqi yo'q")
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpire')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('organizationId')
  globalRouter.push({ name: 'login' })
}
