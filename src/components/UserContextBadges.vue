<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCurrentUser } from '@/composables/useCurrentUser'
import api from '@/api'
import { useQuery } from '@tanstack/vue-query'

const { t } = useI18n()
const { user, isAdmin, isTeacher } = useCurrentUser()

const { data: classData } = useQuery({
  queryKey: ['class-info-badge', computed(() => user.value?.classId)],
  queryFn: () => api.get(`/api/classes/${user.value?.classId}`),
  enabled: computed(() => !!user.value?.classId),
  select: (res: any) => res?.data?.result
})

const userClass = computed(() => {
  if (classData.value) return `${classData.value.degree}-${classData.value.symbol}`
  return ''
})

const show = computed(() => !!user.value && !isAdmin.value)
</script>

<template>
  <div v-if="show" class="flex flex-wrap items-center gap-1.5 mt-1">
    <span
      v-if="user?.region?.name"
      class="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 font-medium"
    >
      {{ user.region.name }}
    </span>
    <span
      v-if="user?.city?.name"
      class="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 font-medium"
    >
      {{ user.city.name }}
    </span>
    <span
      v-if="user?.schoolName"
      class="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 font-medium"
    >
      {{ user.schoolName }}
    </span>
    <span
      v-if="isTeacher && userClass"
      class="text-xs text-white bg-[#ff792d] rounded-md px-2 py-0.5 font-medium"
    >
      {{ t('sinf') }} {{ userClass }}
    </span>
  </div>
</template>
