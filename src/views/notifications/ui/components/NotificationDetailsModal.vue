<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetNotificationDetails, useGetNotificationReceivers } from '../../query'
import DataTable from './DataTable.vue'
import { receiversColumns } from './receiversColumns'
import type { GetNotificationReceiversParams } from '../../types'

const props = defineProps<{
  open: boolean
  id: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const receiversParams = ref<GetNotificationReceiversParams>({
  page: 1,
  size: 10
})

const notificationId = computed(() => props.id || undefined)

const { data: detailsData, isLoading: isLoadingDetails } = useGetNotificationDetails(notificationId)
const { data: receiversData, isLoading: isLoadingReceivers } = useGetNotificationReceivers(notificationId, receiversParams)

const details = computed(() => detailsData.value?.data?.data)
const receivers = computed(() => receiversData.value?.data?.data || [])

const pagination = computed(() => {
  if (receiversData.value?.headers?.['x-pagination']) {
    const xPag = JSON.parse(receiversData.value?.headers?.['x-pagination'])
    return {
      currentPage: xPag.currentPage || 1,
      totalCount: xPag.totalCount || 0,
      totalPages: xPag.totalPages || 1,
      pageSize: xPag.pageSize || receiversParams.value.size || 10,
      canPrevPage: xPag.hasPrevious || false,
      canNextPage: xPag.hasNext || false
    }
  } else {
    return {
      currentPage: receiversParams.value.page || 1,
      totalCount: receivers.value.length,
      totalPages: 1,
      pageSize: receiversParams.value.size || 10,
      canPrevPage: false,
      canNextPage: false
    }
  }
})

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  if (val.page !== undefined) {
    receiversParams.value.page = val.page
  }
  if (val.size !== undefined) {
    receiversParams.value.size = val.size
    receiversParams.value.page = 1 
  }
}

watch(() => props.id, () => {
  receiversParams.value = { page: 1, size: 10 }
})

const closeDialog = () => {
  isOpen.value = false
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[85vh]">
       <div class="absolute right-3 top-3 z-10">
        <button
          @click="closeDialog"
          class="rounded-md hover:opacity-100 transition bg-white"
          aria-label="Close"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" />
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0" />
            <path
              d="M20 12L12 20M12 12L20 20"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <DialogHeader class="bg-gray-50 p-5 border-b border-border shrink-0">
        <DialogTitle>{{ t('notification-details') }}</DialogTitle>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto p-5 space-y-6">
        <div v-if="isLoadingDetails" class="text-center py-4">
            {{ t('loading') }}...
        </div>
        <div v-else-if="details" class="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
            <div>
                <span class="text-sm text-gray-500 block">{{ t('template') }}</span>
                <span class="font-medium">{{ details.template?.type }}</span>
            </div>
            <div>
                <span class="text-sm text-gray-500 block">{{ t('created-at') }}</span>
                <span class="font-medium">{{ new Date(details.createdAt).toLocaleString() }}</span>
            </div>
             <div>
                <span class="text-sm text-gray-500 block">{{ t('receivers-count') }}</span>
                <span class="font-medium">{{ details.receiversCount }}</span>
            </div>
        </div>

        <div class="space-y-3">
             <h3 class="font-medium text-lg">{{ t('receivers') }}</h3>
             <DataTable 
                :columns="receiversColumns" 
                :data="receivers" 
                :loading="isLoadingReceivers"
                :pagination="pagination"
                @update:pagination="handlePaginationUpdate"
            />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
