<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import { useGetDeposits } from '../../query/useGetDeposits'
import { useGetTerminalById } from '../../query/useGetTerminalById'
import CreateDepositDialog from './CreateDepositDialog.vue'
import { useColumns } from './columns'
import DataTable from './DepositsDataTable.vue'
import type { DepositsListParams } from '../../types'
import { Button } from '@/components/ui/button'
import { ReloadIcon } from '@radix-icons/vue'
import { useSyncBalance } from '../../query/useSyncBalance'
import { toast } from 'vue-sonner'

interface Props {
  eposTerminalId: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const params = ref<DepositsListParams>({
  page: 1,
  size: 10
})

const columns = useColumns()
const terminalIdRef = computed(() => props.eposTerminalId)
const { data: depositsData, isLoading, isError} = useGetDeposits(terminalIdRef, params)
const { data: terminalData } = useGetTerminalById(terminalIdRef)
const isXazna = computed(() => terminalData.value?.data?.paymentMethod?.provider?.toLowerCase() === 'xazna')

const deposits = computed(() => depositsData.value?.data?.data || [])

const tablePagination = computed(() => {
  if (depositsData.value?.headers?.['x-pagination']) {
    const xPag = JSON.parse(depositsData.value?.headers?.['x-pagination'])
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
    params.value.page = 1 // Reset to first page when changing page size
  }
}

const totalDepositsAmount = computed(() => {
  return terminalData.value?.data?.credit || 0
})

const { mutate: sync, isPending: isSyncing } = useSyncBalance()

const handleSync = () => {
  sync(props.eposTerminalId, {
    onSuccess: () => {
      toast.success(t('balance-synced-successfully'))
    },
    onError: (error: any) => {
      const errorCode = error?.response?.data?.error?.code
      if (errorCode === 'NoBalanceToSync') {
        toast.info(t('no-balance-to-sync'))
      } else if (errorCode === 'RateLimitExceeded') {
        toast.error(t('error.rate-limit-exceeded'))
      } else if (errorCode === 'HasPendingDeposits') {
        toast.error(t('error.has-pending-deposits'))
      } else {
        toast.error(t('error-occurred'))
      }
    }
  })
}
</script>

<template>
  <div class="space-y-6 mt-8">
    <!-- Summary Card -->
    <Card class="bg-gradient-to-r from-green-50 to-blue-50 shadow-none border-gray-200">
      <CardContent class="grid lg:grid-cols-2 gap-3 p-5">
        <div class="flex items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 46 46"
            fill="none"
          >
            <rect width="46" height="46" rx="10" fill="#EBF9F4" />
            <path
              d="M25.8 20C25.6188 19.6858 25.3557 19.4267 25.0386 19.2506C24.7215 19.0744 24.3625 18.9878 24 19H22C21.4696 19 20.9609 19.2107 20.5858 19.5858C20.2107 19.9609 20 20.4696 20 21C20 21.5304 20.2107 22.0391 20.5858 22.4142C20.9609 22.7893 21.4696 23 22 23H24C24.5304 23 25.0391 23.2107 25.4142 23.5858C25.7893 23.9609 26 24.4696 26 25C26 25.5304 25.7893 26.0391 25.4142 26.4142C25.0391 26.7893 24.5304 27 24 27H22C21.6375 27.0122 21.2785 26.9256 20.9614 26.7495C20.6443 26.5733 20.3812 26.3142 20.2 26M23 18V28M14 23C14 24.1819 14.2328 25.3522 14.6851 26.4442C15.1374 27.5361 15.8003 28.5282 16.636 29.364C17.4718 30.1997 18.4639 30.8626 19.5558 31.3149C20.6478 31.7672 21.8181 32 23 32C24.1819 32 25.3522 31.7672 26.4442 31.3149C27.5361 30.8626 28.5282 30.1997 29.364 29.364C30.1997 28.5282 30.8626 27.5361 31.3149 26.4442C31.7672 25.3522 32 24.1819 32 23C32 21.8181 31.7672 20.6478 31.3149 19.5558C30.8626 18.4639 30.1997 17.4718 29.364 16.636C28.5282 15.8003 27.5361 15.1374 26.4442 14.6851C25.3522 14.2328 24.1819 14 23 14C21.8181 14 20.6478 14.2328 19.5558 14.6851C18.4639 15.1374 17.4718 15.8003 16.636 16.636C15.8003 17.4718 15.1374 18.4639 14.6851 19.5558C14.2328 20.6478 14 21.8181 14 23Z"
              stroke="#33B586"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div class="relative z-10">
            <div class="text-2xl font-bold text-gray-900 tracking-tight">
              {{ totalDepositsAmount?.toLocaleString() }} {{ t('currency') }}
            </div>
            <p class="text-[#596881]">
              {{ t('total-credit') }}
            </p>
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold">
            {{ tablePagination.totalCount }}
          </p>
          <p class="text-base text-[#596881]">{{ t('deposits-count') }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Deposits Table -->
    <div>
      <h4
        class="p-4 rounded-t-lg font-bold text-lg border-t border-l border-r border-[#DFE6F0] flex justify-between items-center"
      >
        {{ t('deposits-list') }}
        <Can i="payment.terminal.deposits.modifier" >
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              :disabled="isSyncing"
              @click="handleSync"
            >
              <ReloadIcon class="mr-2 h-4 w-4" :class="{ 'animate-spin': isSyncing }" />
              {{ t('sync-balance') }}
            </Button>
            <div v-if="!isXazna">
              <CreateDepositDialog :epos-terminal-id="eposTerminalId" />
            </div>
          </div>
        </Can>
      </h4>

      <template v-if="isError">
        <div class="text-center py-8">
          <p class="text-red-600">{{ t('error-occurred') }}</p>
        </div>
      </template>

      <template v-else-if="isLoading">
        <div class="text-center py-8">
          <p class="text-gray-500">{{ t('loading') }}</p>
        </div>
      </template>

      <DataTable 
        :columns="columns" 
        :data="deposits" 
        :loading="isLoading"
        :pagination="tablePagination"
        @update:pagination="handlePaginationUpdate"
      />
    </div>
  </div>
</template>

