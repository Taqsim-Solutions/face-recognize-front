<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { prettify } from '@/lib/utils'
import { useGetPaymentRequestsStat } from '../query/useGetPaymentRequestsStats'

const { t } = useI18n()
const { data, isLoading, isError, error } = useGetPaymentRequestsStat()
</script>

<template>
  <div v-if="isLoading">{{ t('loading') }}...</div>
  <div v-else-if="isError && error">
    {{ error.message }}
  </div>
  <div v-else-if="data && !isError && !isLoading">
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between border-b">
        <p>{{ t('total-count') }}</p>
        <p>{{ data.data.data.totalCount }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('paid-total-count') }}</p>
        <p>{{ data.data.data.paidTotalCount }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('in-process-total-count') }}</p>
        <p>{{ data.data.data.inProccessTotalCount }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('canceled-total-count') }}</p>
        <p>{{ data.data.data.canceledTotalCount }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('total-amount') }}</p>
        <p>{{ `${prettify(data.data.data.totalAmount)} ${t('currency')}` }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('paid-requests-total-amount') }}</p>
        <p>{{ `${prettify(data.data.data.paidRequestsTotalAmount)} ${t('currency')}` }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('in-process-total-amount') }}</p>
        <p>{{ `${prettify(data.data.data.inProccessTotalAmount)} ${t('currency')}` }}</p>
      </div>

      <div class="flex items-center justify-between border-b">
        <p>{{ t('canceled-total-amount') }}</p>
        <p>{{ `${prettify(data.data.data.canceledTotalAmount)} ${t('currency')}` }}</p>
      </div>
    </div>
  </div>
</template>
