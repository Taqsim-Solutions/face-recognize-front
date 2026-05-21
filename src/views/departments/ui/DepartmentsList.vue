<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { useGetDepartments } from '../query/useGetDepartments'
import Can from '@/components/can.vue'
import CreateDepartmentDialog from './components/CreateDepartmentDialog.vue'
import DataTable from './components/DataTable.vue'
import { columns } from './components/columns'
import type { GetDepartmentsParams } from '../types'
import { watchDebounced } from '@vueuse/core'

const { t } = useI18n()

const params = ref<GetDepartmentsParams>({
  page: 1,
  size: 10,
  containsName: ''
})

const { data: departmentsData, isLoading } = useGetDepartments(params)

const departments = computed(() => departmentsData.value?.data?.data || [])

const pagination = computed(() => {
  if (departmentsData.value?.headers?.['x-pagination']) {
    const xPag = JSON.parse(departmentsData.value?.headers?.['x-pagination'])
    return {
      currentPage: xPag.currentPage || 1,
      totalCount: xPag.totalCount || 0,
      totalPages: xPag.totalPages || 1,
      pageSize: xPag.pageSize || params.value.size || 10,
      canPrevPage: xPag.hasPrevious || false,
      canNextPage: xPag.hasNext || false
    }
  } else {
    return {
      currentPage: params.value.page || 1,
      totalCount: 0,
      totalPages: 1,
      pageSize: params.value.size || 10,
      canPrevPage: false,
      canNextPage: false
    }
  }
})

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  if (val.page !== undefined) {
    params.value.page = val.page
  }
  if (val.size !== undefined) {
    params.value.size = val.size
    params.value.page = 1 
  }
}

const searchValue = ref('')

watchDebounced(
  searchValue,
  (val) => {
    params.value.containsName = val
    params.value.page = 1
  },
  { debounce: 500 }
)
</script>

<template>
  <!-- Header Section -->
  <header
    class="flex flex-col md:flex-row justify-between items-center md:items-center gap-3 border-b lg:pb-3 pb-5 px-6"
  >
    <div class="flex flex-col mt-1">
      <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
        {{ t('departments') }}
      </h2>
    </div>

    <div class="flex lg:flex-nowrap flex-wrap items-center gap-3">
      <Input
        id="departments-search"
        name="search"
        v-model="searchValue"
        :placeholder="t('search')"
        class="w-[300px] h-9"
      >
            <template #left>
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </template>
        </Input>
      <Can i="departments.modifier">
        <CreateDepartmentDialog />
      </Can>
    </div>
  </header>

  <div class="mt-6 w-full px-6">
    <DataTable 
      :columns="columns" 
      :data="departments" 
      :loading="isLoading"
      :pagination="pagination"
      @update:pagination="handlePaginationUpdate"
    />
  </div>
</template>
