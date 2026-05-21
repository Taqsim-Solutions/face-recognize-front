import { computed } from 'vue'
import { usePermissions } from '@/api/usePermissions'

export function useCheckPermission(permissionName: string) {
  const { data: permissions, isLoading } = usePermissions()

  const hasPermission = computed(() => {
    if (isLoading.value || !permissions.value?.permissions) return false
    return permissions.value.permissions.some((p) => p.name === permissionName)
  })

  return {
    hasPermission,
    isLoading
  }
}
