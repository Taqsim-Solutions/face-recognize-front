<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import EmployeesList from '@/views/users/list/ui/UsersLIst.vue'
import { useGetDepartment } from '../query'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = String(route.params.id)

const { data: departmentData, isLoading } = useGetDepartment(id)
const departmentName = computed(() => departmentData.value?.data?.data?.name || '')
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="border-b border-gray-300/60 px-6 flex justify-between mb-5 pb-3.5 pt-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            @click="router.push({ name: 'departments-list' })"
            class="text-[#596881] transition-colors border h-9 w-9 opacity-100 rounded-xl border-[#E0E6F0]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              style="transform: scale(1.8)"
            >
              <path
                d="M3.33337 8.00016H12.6667M3.33337 8.00016L6.00004 10.6668M3.33337 8.00016L6.00004 5.3335"
                stroke="#596881"
                stroke-width="1.56"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Button>
          <div class="flex gap-2.5 items-center">
            <RouterLink :to="{ name: 'departments-list' }">
              <p class="text-lg font-bold text-[#8796AF] bg-clip-text">
                {{ t('departments') }}
              </p>
            </RouterLink>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="#8796AF"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p
              class="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            >
              {{ isLoading ? '...' : departmentName }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Employees List (Filtered by Department) -->
    <div class="flex-1">
      <EmployeesList :department-id="id" />
    </div>
  </div>
</template>
