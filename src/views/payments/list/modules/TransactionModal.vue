<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  transaction: any | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const getDetailValue = (val: any) => {
  if (val === null || val === undefined) return '—'
  return t(val)
}

const formatCurrency = (val: any) => {
  if (!val) return '0'
  return val.toLocaleString() + ' ' + t('currency')
}

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return dayjs(dateString).format('DD.MM.YYYY HH:mm:ss')
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
      <DialogHeader class="border-b pb-4 mb-2 bg-white z-20">
        <DialogTitle class="text-xl font-semibold text-gray-900">
          {{ t('transaction-details') }}
        </DialogTitle>

        <button
          @click="isOpen = false"
          class="absolute right-4 top-4 rounded-md hover:opacity-100 transition bg-white z-10"
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
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white"></rect>
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0"></rect>
          <path
            d="M20 12L12 20M12 12L20 20"
            stroke="#596881"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      </button>
      </DialogHeader>

      <div class="grid gap-4 py-2 pt-0" v-if="transaction">
        <!-- Core info -->
        <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-300">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('paymentNumber') }}:</span>
            <span class="text-gray-900 font-semibold">{{ getDetailValue(transaction.paymentNumber) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('amount') }}:</span>
            <span class="text-gray-900 font-semibold">{{ formatCurrency(transaction.amount) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('paid') }}:</span>
            <span class="text-[#0F9A58] font-bold">{{ formatCurrency(transaction.paid) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('commission') }}:</span>
            <span class="text-gray-900 font-medium">{{ formatCurrency(transaction.commission) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('date') }}:</span>
            <span class="text-gray-900 font-medium">{{ formatDate(transaction.createdAt) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('paymentType') }}:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.paymentType) }}</span>
          </div>
        </div>

        <!-- User info -->
        <div class="space-y-3 bg-white p-4 rounded-lg border border-gray-300">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('full-name') }}:</span>
            <span class="text-gray-900 font-semibold">{{ getDetailValue(transaction.user?.firstName) }} {{ getDetailValue(transaction.user?.lastName) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('phone-number') }}:</span>
            <span class="text-gray-900 font-medium">+{{ getDetailValue(transaction.user?.phoneNumber) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">PINFL:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.pinfl) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('card-number') }}:</span>
            <span class="text-gray-900 font-semibold">{{ getDetailValue(transaction.card?.maskedNumber) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('provider') }}:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.salaryRequest?.provider) }}</span>
          </div>
        </div>

        <!-- OFD info -->
        <div v-if="transaction.salaryPaymentOFD" class="space-y-3 bg-white p-4 rounded-lg border border-gray-300">
          <h3 class="font-semibold text-gray-900 border-b pb-2 mb-2">OFD {{ t('details').toLowerCase() }}</h3>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('terminal-id') }}:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.salaryPaymentOFD.terminalID) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('date') }}:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.salaryPaymentOFD.dateTime) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">{{ t('fiscal-sign') || 'Fiscal Sign' }}:</span>
            <span class="text-gray-900 font-medium">{{ getDetailValue(transaction.salaryPaymentOFD.fiscalSign) }}</span>
          </div>
          <div v-if="transaction.salaryPaymentOFD.qrCodeURL" class="flex justify-between items-center text-sm pt-2 border-t mt-2">
            <span class="text-gray-500 font-medium">{{ t('qr-code') }}:</span>
            <a :href="transaction.salaryPaymentOFD.qrCodeURL" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium underline">
              {{ t('view-receipt') || 'View Receipt' }}
            </a>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
