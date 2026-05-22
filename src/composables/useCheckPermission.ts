import { computed, ref } from 'vue'

export function useCheckPermission(_permissionName: string) {
  const hasPermission = computed(() => true)
  const isLoading = ref(false)

  return {
    hasPermission,
    isLoading
  }
}
