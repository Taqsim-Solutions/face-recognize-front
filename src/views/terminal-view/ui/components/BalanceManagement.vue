<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAllocateBalance } from '../../query/useAllocateBalance'
import { useReleaseBalance } from '../../query/useReleaseBalance'
import { useGetTerminalBalance } from '../../query/useGetTerminalBalance'
import { toast } from 'vue-sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  eposTerminalId: number
  orgId: string
  terminalBalance?: number
}

const props = defineProps<Props>()

const { t } = useI18n()

// Fetch terminal balance from API
const { data: terminalBalanceData, isLoading: isBalanceLoading } = useGetTerminalBalance(props.eposTerminalId)

// Form states
const allocateAmount = ref<number>()
const releaseAmount = ref<number>()

// Mutations
const allocateBalanceMutation = useAllocateBalance(props.eposTerminalId, props.orgId)
const releaseBalanceMutation = useReleaseBalance(props.eposTerminalId, props.orgId)

const availableTerminalBalance = computed(() => {
  return terminalBalanceData.value?.data?.data.available || 0
})

const allocatedBalance = computed(() => {
  return terminalBalanceData.value?.data?.data.allocated || 0
})

// Validation
const isAllocateFormValid = computed(() => {
  return (
    allocateAmount.value &&
    allocateAmount.value > 0 &&
    allocateAmount.value <= availableTerminalBalance.value
  )
})

const isReleaseFormValid = computed(() => {
  return releaseAmount.value && releaseAmount.value > 0
})

// Handlers
const handleAllocateBalance = async () => {
  if (!isAllocateFormValid.value) return

  try {
    await allocateBalanceMutation.mutateAsync({
      amount: allocateAmount.value!
    })
    allocateAmount.value = undefined
    toast.success(t('balance-allocated-successfully'))
  } catch (error: any) {
    const message = error.response?.data?.error?.message || t('error-occurred')
    toast.error(message)
  }
}

const handleReleaseBalance = async () => {
  if (!isReleaseFormValid.value) return

  try {
    await releaseBalanceMutation.mutateAsync({
      amount: releaseAmount.value!
    })
    releaseAmount.value = undefined
    toast.success(t('balance-released-successfully'))
  } catch (error: any) {
    const message = error.response?.data?.error?.message || t('error-occurred')
    toast.error(message)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2 mt-8">
      <Card
        class="relative border border-[#E0E6F0] overflow-hidden rounded-2xl bg-white shadow-sm items-center flex p-5 h-[100px]"
      >
        <div
          class="absolute top-0 right-0 w-40 h-24 bg-gradient-to-br from-[#2363DA]/20 to-[#2363DA]/40 rounded-full blur-3xl translate-x-10 -translate-y-10 pointer-events-none"
        />

        <div class="flex items-center gap-4 w-full">
          <div v-if="isBalanceLoading" class="flex items-center gap-4 w-full">
             <Skeleton class="h-14 w-14 rounded-xl" />
             <div class="space-y-2 flex-1">
               <Skeleton class="h-8 w-1/2" />
               <Skeleton class="h-4 w-1/3" />
             </div>
          </div>
          <template v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 46 46"
              fill="none"
            >
              <rect width="46" height="46" rx="10" fill="#E9F0FE" />
              <path
                d="M28 19V16C28 15.7348 27.8946 15.4804 27.7071 15.2929C27.5196 15.1054 27.2652 15 27 15H17C16.4696 15 15.9609 15.2107 15.5858 15.5858C15.2107 15.9609 15 16.4696 15 17M15 17C15 17.5304 15.2107 18.0391 15.5858 18.4142C15.9609 18.7893 16.4696 19 17 19H29C29.2652 19 29.5196 19.1054 29.7071 19.2929C29.8946 19.4804 30 19.7348 30 20V23M15 17V29C15 29.5304 15.2107 30.0391 15.5858 30.4142C15.9609 30.7893 16.4696 31 17 31H29C29.2652 31 29.5196 30.8946 29.7071 30.7071C29.8946 30.5196 30 30.2652 30 30V27M31 23V27H27C26.4696 27 25.9609 26.7893 25.5858 26.4142C25.2107 26.0391 25 25.5304 25 25C25 24.4696 25.2107 23.9609 25.5858 23.5858C25.9609 23.2107 26.4696 23 27 23H31Z"
                stroke="#2363DA"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="relative z-10">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                {{ availableTerminalBalance?.toLocaleString() }} {{ t('currency') }}
              </div>
              <p class="text-[#596881]">
                {{ t('available-for-allocation') }}
              </p>
            </div>
          </template>
        </div>
      </Card>

      <Card
        class="relative border border-[#E0E6F0] overflow-hidden rounded-2xl bg-white shadow-sm items-center flex p-5 h-[100px]"
      >
        <div
          class="absolute top-0 right-0 w-40 h-24 bg-gradient-to-br from-[#33B586]/40 to-[#33B586]/70 rounded-full blur-3xl translate-x-10 -translate-y-10 pointer-events-none"
        />

        <div class="flex items-center gap-4 w-full">
           <div v-if="isBalanceLoading" class="flex items-center gap-4 w-full">
             <Skeleton class="h-14 w-14 rounded-xl" />
             <div class="space-y-2 flex-1">
               <Skeleton class="h-8 w-1/2" />
               <Skeleton class="h-4 w-1/3" />
             </div>
          </div>
          <template v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
            >
              <path
                d="M0 16C0 10.3995 0 7.59921 1.08993 5.46009C2.04867 3.57847 3.57847 2.04867 5.46009 1.08993C7.59921 0 10.3995 0 16 0H30C35.6005 0 38.4008 0 40.5399 1.08993C42.4215 2.04867 43.9513 3.57847 44.9101 5.46009C46 7.59921 46 10.3995 46 16V30C46 35.6005 46 38.4008 44.9101 40.5399C43.9513 42.4215 42.4215 43.9513 40.5399 44.9101C38.4008 46 35.6005 46 30 46H16C10.3995 46 7.59921 46 5.46009 44.9101C3.57847 43.9513 2.04867 42.4215 1.08993 40.5399C0 38.4008 0 35.6005 0 30V16Z"
                fill="#EBF9F4"
              />
              <path
                d="M16.5 19.25C16.9142 19.25 17.25 19.5858 17.25 20V26C17.25 26.4142 16.9142 26.75 16.5 26.75C16.0858 26.75 15.75 26.4142 15.75 26V20C15.75 19.5858 16.0858 19.25 16.5 19.25Z"
                fill="#33B586"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M25.5 18.25C22.8766 18.25 20.75 20.3766 20.75 23C20.75 25.6234 22.8766 27.75 25.5 27.75C28.1234 27.75 30.25 25.6234 30.25 23C30.25 20.3766 28.1234 18.25 25.5 18.25ZM23.0069 20.9149C23.6031 20.2029 24.4987 19.75 25.5 19.75C26.5013 19.75 27.3969 20.2029 27.9931 20.9149L25.5 22.1615L23.0069 20.9149ZM26.2482 23.4644L28.6645 22.2563C28.7204 22.4951 28.75 22.7441 28.75 23C28.75 24.537 27.6831 25.8247 26.2495 26.1631L26.2482 23.4644ZM22.3355 22.2563C22.2796 22.4951 22.25 22.7441 22.25 23C22.25 24.5366 23.3164 25.8242 24.7495 26.1629L24.7482 23.4626L22.3355 22.2563Z"
                fill="#33B586"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.75 17C12.75 14.6528 14.6528 12.75 17 12.75H29C31.3472 12.75 33.25 14.6528 33.25 17V29C33.25 30.0488 32.8701 31.0088 32.2405 31.75H33C33.4142 31.75 33.75 32.0858 33.75 32.5C33.75 32.9142 33.4142 33.25 33 33.25H13C12.5858 33.25 12.25 32.9142 12.25 32.5C12.25 32.0858 12.5858 31.75 13 31.75H13.7595C13.1299 31.0088 12.75 30.0488 12.75 29V17ZM17 31.75H29C30.5188 31.75 31.75 30.5188 31.75 29V17C31.75 15.4812 30.5188 14.25 29 14.25H17C15.4812 14.25 14.25 15.4812 14.25 17V29C14.25 30.5188 15.4812 31.75 17 31.75Z"
                fill="#33B586"
              />
            </svg>
            <div class="relative z-10">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                {{ allocatedBalance?.toLocaleString() }} {{ t('currency') }}
              </div>
              <p class="text-[#596881]">{{ t('total-allocated-amount') }}</p>
            </div>
          </template>
        </div>
      </Card>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Allocate Balance -->
      <Card class="rounded-2xl border border-gray-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2 text-green-700 text-xl">
            <span>{{ t('allocate-balance') }}</span>
          </CardTitle>
          <p class="text-sm text-[#596881] -mt-1">
            {{ t('allocate-balance-description') }}
          </p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="allocate-amount" class="text-[#596881] text-base">{{ t('amount') }}</Label>
            <Input
              id="allocate-amount"
              v-model.number="allocateAmount"
              type="number"
              :placeholder="t('enter-amount')"
              min="1"
              :max="availableTerminalBalance"
              class="w-full p-4 h-[40px] border border-[#E0E6F0] mb-1 text-base"
            />
            <p
              v-if="allocateAmount && allocateAmount > availableTerminalBalance"
              class="text-xs text-red-500"
            >
              {{ t('amount-exceeds-balance') }}
            </p>
          </div>

          <Button
            @click="handleAllocateBalance"
            :disabled="!isAllocateFormValid || allocateBalanceMutation.isPending.value"
            :loading="allocateBalanceMutation.isPending.value"
            class="w-full bg-[#2363DA] hover:bg-green-700 rounded-lg disabled:opacity-100 text-base h-[42px]"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="18"
              viewBox="0 0 19 18"
              fill="none"
              class="mr-2"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.5 5.43741C11.6619 5.43741 10.9461 5.89164 10.459 6.54109C9.97206 7.19036 9.6875 8.06154 9.6875 8.99991C9.6875 9.93828 9.97206 10.8095 10.459 11.4587C10.9461 12.1082 11.6619 12.5624 12.5 12.5624C13.3381 12.5624 14.0539 12.1082 14.541 11.4587C15.0279 10.8095 15.3125 9.93828 15.3125 8.99991C15.3125 8.06154 15.0279 7.19036 14.541 6.54109C14.0539 5.89164 13.3381 5.43741 12.5 5.43741ZM11.2005 7.45746C11.2498 7.37168 11.3028 7.29105 11.359 7.21609C11.6863 6.77975 12.0954 6.56241 12.5 6.56241C12.9046 6.56241 13.3137 6.77975 13.641 7.21609C13.6972 7.29106 13.7503 7.37171 13.7995 7.45751L12.5001 8.32384L11.2005 7.45746ZM13.0611 9.30188L14.1607 8.56885C14.1782 8.70815 14.1875 8.85213 14.1875 8.99991C14.1875 9.7184 13.9684 10.3472 13.641 10.7837C13.4669 11.0159 13.2696 11.186 13.0621 11.2945L13.0611 9.30188ZM10.8394 8.56878C10.8218 8.7081 10.8125 8.85211 10.8125 8.99991C10.8125 9.7184 11.0316 10.3472 11.359 10.7837C11.5329 11.0156 11.7299 11.1856 11.9371 11.2941L11.9361 9.29995L10.8394 8.56878Z"
                fill="white"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.4375 4.03195C7.4375 3.59477 7.52895 3.18353 7.69265 2.81241H5.375C4.23591 2.81241 3.3125 3.73582 3.3125 4.87491V5.62491C3.3125 5.93557 3.06066 6.18741 2.75 6.18741C2.43934 6.18741 2.1875 5.93557 2.1875 5.62491V4.87491C2.1875 3.1145 3.61459 1.68741 5.375 1.68741H8.375C8.42581 1.68741 8.47503 1.69414 8.52185 1.70677C9.21389 1.11896 10.1631 0.82154 11.1458 0.979497L14.8958 1.58224C16.4195 1.82714 17.5625 3.10629 17.5625 4.63469V13.3649C17.5625 14.0448 17.3364 14.6753 16.9511 15.1874H17C17.3107 15.1874 17.5625 15.4392 17.5625 15.7499C17.5625 16.0606 17.3107 16.3124 17 16.3124H15.5C15.4599 16.3124 15.4208 16.3082 15.3831 16.3003C15.226 16.3511 15.0632 16.3905 14.8958 16.4174L11.1458 17.0201C10.1741 17.1763 9.23509 16.8872 8.54513 16.3124H2C1.68934 16.3124 1.4375 16.0606 1.4375 15.7499C1.4375 15.4392 1.68934 15.1874 2 15.1874H2.94464C2.4724 14.6315 2.1875 13.9115 2.1875 13.1249V12.3749C2.1875 12.0642 2.43934 11.8124 2.75 11.8124C3.06066 11.8124 3.3125 12.0642 3.3125 12.3749V13.1249C3.3125 14.264 4.23591 15.1874 5.375 15.1874H7.69275C7.52898 14.8162 7.4375 14.4049 7.4375 13.9676V4.03195ZM10.9673 2.09024C9.68529 1.88418 8.5625 2.83764 8.5625 4.03195V13.9676C8.5625 15.162 9.68529 16.1154 10.9673 15.9094L14.7173 15.3066C15.7251 15.1446 16.4375 14.3115 16.4375 13.3649V4.63469C16.4375 3.68808 15.7251 2.85497 14.7173 2.69298L10.9673 2.09024Z"
                fill="white"
              />
              <path
                d="M3.14013 7.06882C3.37822 6.86926 3.733 6.90051 3.93256 7.1386C4.13211 7.37669 4.10087 7.73147 3.86277 7.93103L3.25859 8.43741H6.00049C6.31115 8.43741 6.56299 8.68925 6.56299 8.99991C6.56299 9.31057 6.31115 9.56241 6.00049 9.56241H3.25874L3.86284 10.0689C4.1009 10.2685 4.13209 10.6232 3.9325 10.8613C3.73292 11.0994 3.37813 11.1306 3.14007 10.931L1.82205 9.82597C1.58003 9.62311 1.45268 9.33764 1.44 9.04786C1.43867 9.03205 1.43799 9.01606 1.43799 8.99991C1.43799 8.98387 1.43866 8.96798 1.43998 8.95228C1.4525 8.66226 1.57988 8.37651 1.82211 8.17349L3.14013 7.06882Z"
                fill="white"
              />
            </svg>
            {{ allocateBalanceMutation.isPending.value ? t('allocating') : t('allocate-balance') }}
          </Button>
        </CardContent>
      </Card>

      <!-- Release Balance -->
      <Card class="rounded-2xl border border-gray-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2 text-green-700 text-xl">
            <span>{{ t('release-balance') }}</span>
          </CardTitle>
          <p class="text-sm text-[#596881] -mt-1">
            {{ t('release-balance-description') }}
          </p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="release-amount" class="text-[#596881] text-base">{{ t('amount') }}</Label>
            <Input
              id="release-amount"
              v-model.number="releaseAmount"
              type="number"
              :placeholder="t('enter-amount')"
              min="1"
              class="w-full p-4 h-[40px] border border-[#E0E6F0] mb-1 text-base"
            />
          </div>

          <Button
            @click="handleReleaseBalance"
            :disabled="!isReleaseFormValid || releaseBalanceMutation.isPending.value"
            :loading="releaseBalanceMutation.isPending.value"
            class="w-full bg-[#29A679] hover:bg-green-700 rounded-lg disabled:opacity-100 text-base h-[42px]"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="18"
              viewBox="0 0 19 18"
              fill="none"
              class="mr-2"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.5 5.43741C11.6619 5.43741 10.9461 5.89164 10.459 6.54109C9.97206 7.19036 9.6875 8.06154 9.6875 8.99991C9.6875 9.93828 9.97206 10.8095 10.459 11.4587C10.9461 12.1082 11.6619 12.5624 12.5 12.5624C13.3381 12.5624 14.0539 12.1082 14.541 11.4587C15.0279 10.8095 15.3125 9.93828 15.3125 8.99991C15.3125 8.06154 15.0279 7.19036 14.541 6.54109C14.0539 5.89164 13.3381 5.43741 12.5 5.43741ZM11.2005 7.45746C11.2498 7.37168 11.3028 7.29105 11.359 7.21609C11.6863 6.77975 12.0954 6.56241 12.5 6.56241C12.9046 6.56241 13.3137 6.77975 13.641 7.21609C13.6972 7.29106 13.7503 7.37171 13.7995 7.45751L12.5001 8.32384L11.2005 7.45746ZM13.0611 9.30188L14.1607 8.56885C14.1782 8.70815 14.1875 8.85213 14.1875 8.99991C14.1875 9.7184 13.9684 10.3472 13.641 10.7837C13.4669 11.0159 13.2696 11.186 13.0621 11.2945L13.0611 9.30188ZM10.8394 8.56878C10.8218 8.7081 10.8125 8.85211 10.8125 8.99991C10.8125 9.7184 11.0316 10.3472 11.359 10.7837C11.5329 11.0156 11.7299 11.1856 11.9371 11.2941L11.9361 9.29995L10.8394 8.56878Z"
                fill="white"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.4375 4.03195C7.4375 3.59477 7.52895 3.18353 7.69265 2.81241H5.375C4.23591 2.81241 3.3125 3.73582 3.3125 4.87491V5.62491C3.3125 5.93557 3.06066 6.18741 2.75 6.18741C2.43934 6.18741 2.1875 5.93557 2.1875 5.62491V4.87491C2.1875 3.1145 3.61459 1.68741 5.375 1.68741H8.375C8.42581 1.68741 8.47503 1.69414 8.52185 1.70677C9.21389 1.11896 10.1631 0.82154 11.1458 0.979497L14.8958 1.58224C16.4195 1.82714 17.5625 3.10629 17.5625 4.63469V13.3649C17.5625 14.0448 17.3364 14.6753 16.9511 15.1874H17C17.3107 15.1874 17.5625 15.4392 17.5625 15.7499C17.5625 16.0606 17.3107 16.3124 17 16.3124H15.5C15.4599 16.3124 15.4208 16.3082 15.3831 16.3003C15.226 16.3511 15.0632 16.3905 14.8958 16.4174L11.1458 17.0201C10.1741 17.1763 9.23509 16.8872 8.54513 16.3124H2C1.68934 16.3124 1.4375 16.0606 1.4375 15.7499C1.4375 15.4392 1.68934 15.1874 2 15.1874H2.94464C2.4724 14.6315 2.1875 13.9115 2.1875 13.1249V12.3749C2.1875 12.0642 2.43934 11.8124 2.75 11.8124C3.06066 11.8124 3.3125 12.0642 3.3125 12.3749V13.1249C3.3125 14.264 4.23591 15.1874 5.375 15.1874H7.69275C7.52898 14.8162 7.4375 14.4049 7.4375 13.9676V4.03195ZM10.9673 2.09024C9.68529 1.88418 8.5625 2.83764 8.5625 4.03195V13.9676C8.5625 15.162 9.68529 16.1154 10.9673 15.9094L14.7173 15.3066C15.7251 15.1446 16.4375 14.3115 16.4375 13.3649V4.63469C16.4375 3.68808 15.7251 2.85497 14.7173 2.69298L10.9673 2.09024Z"
                fill="white"
              />
              <path
                d="M3.14013 7.06882C3.37822 6.86926 3.733 6.90051 3.93256 7.1386C4.13211 7.37669 4.10087 7.73147 3.86277 7.93103L3.25859 8.43741H6.00049C6.31115 8.43741 6.56299 8.68925 6.56299 8.99991C6.56299 9.31057 6.31115 9.56241 6.00049 9.56241H3.25874L3.86284 10.0689C4.1009 10.2685 4.13209 10.6232 3.9325 10.8613C3.73292 11.0994 3.37813 11.1306 3.14007 10.931L1.82205 9.82597C1.58003 9.62311 1.45268 9.33764 1.44 9.04786C1.43867 9.03205 1.43799 9.01606 1.43799 8.99991C1.43799 8.98387 1.43866 8.96798 1.43998 8.95228C1.4525 8.66226 1.57988 8.37651 1.82211 8.17349L3.14013 7.06882Z"
                fill="white"
              />
            </svg>
            {{ releaseBalanceMutation.isPending.value ? t('releasing') : t('release-balance') }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
