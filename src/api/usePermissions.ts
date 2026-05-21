import { useQuery } from '@tanstack/vue-query'
import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import globalRouter from '@/router'
import axios from '.'

interface Permission {
  name: string
  description: string
}

interface PermissionsResponse {
  data: {
    id: string
    name: string
    permissions: Permission[]
  }
}

export const getPermissions = () => {
  return axios.get<PermissionsResponse>('/api/account/organizations/permissions')
}

export const permissionsQueryOptions = {
  staleTime: 600000,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  queryFn: async () => {
    try {
      const response = await getPermissions()
      return response.data.data
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("Sizda ushbu tizimga kirish huquqi yo'q")
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExpire')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_permissions')
        globalRouter.push({ name: 'login' })
      }
      throw error
    }
  },
  retry: (failureCount: number, error: any) => {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      return false
    }
    return failureCount < 3
  }
}

export const getPermissionsQueryOptions = () => {
  const organizationId = localStorage.getItem('organizationId')
  return {
    ...permissionsQueryOptions,
    queryKey: ['permissions', organizationId],
    enabled: !!organizationId
  }
}

export const usePermissions = () => {
  return useQuery(getPermissionsQueryOptions())
}


export const useHasPermission = (permissionName: string) => {
  const { data: permissions, isLoading, error } = usePermissions()

  const hasPermission = computed(() => {
    if (!permissions.value?.permissions) return false
    return permissions.value.permissions.some(
      (permission: Permission) => permission.name === permissionName
    )
  })

  return {
    hasPermission,
    isLoading,
    error
  }
}

export const useRequirePermission = (permissionName: string) => {
  const { hasPermission, isLoading } = useHasPermission(permissionName)
  const router = useRouter()

  watch(
    [hasPermission, isLoading],
    ([has, loading]) => {
      if (!loading && !has) {
        if (router) {
          router.push({ name: 'home' })
        } else {
          globalRouter.push({ name: 'home' })
        }
      }
    },
    { immediate: true }
  )
}
