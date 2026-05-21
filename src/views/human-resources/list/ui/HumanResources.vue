<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { refDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { useGetEmployeeLeaves } from '../query'
import { deleteEmployeeLeave } from '../api'
import { useQueryClient } from '@tanstack/vue-query'
import type { FetchEmployeeLeavesParams } from '../types'
import { DataTable, useColumns, NewIssueDialog } from '../modules'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import Can from '@/components/can.vue'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const columns = useColumns(router)

const leaveTypes = [
  { value: 'all', label: 'All' },
  { value: '0', label: 'Other' },
  { value: '1', label: 'AnnualLeave' },
  { value: '2', label: 'SickLeave' },
  { value: '3', label: 'MaternityLeave' },
  { value: '4', label: 'PaternityLeave' },
  { value: '5', label: 'PaidLeave' },
  { value: '6', label: 'UnpaidLeave' },
  { value: '7', label: 'BusinessTrip' }
]

const activeTab = ref('all')

// Search and Pagination state
const search = ref('')
const debouncedSearch = refDebounced(search, 800)
const page = ref(1)
const size = ref(20)

// Reset to page 1 on filter changes
watch([activeTab, debouncedSearch, size], () => {
  page.value = 1
})

// Reactive query params
const params = computed<FetchEmployeeLeavesParams>(() => ({
  page: page.value,
  size: size.value,
  search: debouncedSearch.value,
  ...(activeTab.value !== 'all' && { type: activeTab.value })
}))

const { data, isLoading } = useGetEmployeeLeaves(params)

// Pagination handlers
const handlePaginationUpdate = (val: Partial<FetchEmployeeLeavesParams>) => {
  if (val.page) page.value = val.page
  if (val.size) size.value = val.size
}

// Table pagination object
const tablePagination = computed(() => {
  const defaultPag = {
    currentPage: page.value,
    totalCount: 0,
    totalPages: 0,
    pageSize: size.value,
    canPrevPage: false,
    canNextPage: false
  }

  if (data.value?.headers?.['x-pagination']) {
    try {
      const xPag = JSON.parse(data.value.headers['x-pagination'])
      return {
        currentPage: xPag.currentPage,
        totalCount: xPag.totalCount,
        totalPages: xPag.totalPages,
        pageSize: xPag.pageSize,
        canPrevPage: xPag.hasPrevious,
        canNextPage: xPag.hasNext
      }
    } catch (e) {
      console.error('Failed to parse x-pagination header', e)
    }
  }

  return defaultPag
})

// Delete functionality
const handleDelete = async (id: string) => {
  try {
    const response = await deleteEmployeeLeave(id)
    if (response.data.isSuccess) {
      toast.success(t('success.deleted'))
      await queryClient.invalidateQueries({ queryKey: ['employee-leaves'] })
    } else {
      toast.error(response.data.error?.message || t('error-occurred'))
    }
  } catch (error) {
    toast.error((error as any).message || t('error-occurred'))
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <header
      class="flex flex-col md:flex-row justify-between items-center md:items-center gap-3 border-b lg:pb-3 pb-5 px-6"
    >
      <div class="flex flex-col mt-1">
        <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
          {{ t('human-resources') }}
        </h2>
      </div>

      <div class="flex lg:flex-nowrap flex-wrap items-center gap-3">
        <!-- Search input -->
        <label for="search-input" class="sr-only">{{ t('search') }}</label>
        <Input id="search-input" name="search" v-model="search" :placeholder="t('search')" class="w-[300px] h-9">
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

        <Can i="employee.leaves.add">
          <NewIssueDialog />
        </Can>
      </div>
    </header>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="mt-3 px-6">
      <TabsList class="flex-wrap rounded-lg">
        <TabsTrigger
          v-for="type in leaveTypes"
          :key="type.value"
          :value="type.value"
          class="text-sm"
        >
          {{ t(`leave-types.${type.label}`) }}
        </TabsTrigger>
      </TabsList>

      <TabsContent v-for="type in leaveTypes" :key="type.value" :value="type.value">
        <div class="mt-6 w-full">
          <DataTable
            :columns="columns"
            :data="data?.data.data || []"
            :loading="isLoading"
            :pagination="tablePagination"
            @update:pagination="handlePaginationUpdate"
            :on-delete="handleDelete"
          />
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
