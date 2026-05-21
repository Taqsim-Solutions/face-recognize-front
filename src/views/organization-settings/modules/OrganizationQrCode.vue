<script setup lang="ts">
import { useGetOrganizationQrCode } from '../query/useGetOrganizationQrCode'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

defineOptions({ name: 'OrganizationQrCodePage' })
const { data: qrData, isLoading: isQrLoading } = useGetOrganizationQrCode()

const { t } = useI18n()
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-4 mb-5 bg-gray-50">
      <CardTitle class="text-lg font-semibold -mb-1">{{ t('qr-code') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('qr-code-description') }}</p>
    </CardHeader>
    <CardContent>
      <div v-if="isQrLoading" class="space-y-6">
        <Skeleton class="h-[250px] w-[250px] rounded-lg" />
        <Skeleton class="h-10 w-[250px] rounded-lg" />
      </div>
      <div class="mb-3 p-1" v-else-if="qrData?.data.data.qrCodeBase64">
        <img
          :src="`data:image/png;base64,${qrData?.data.data.qrCodeBase64}`"
          alt="QR code"
          class="border rounded-lg"
          width="250"
          height="250"
        />
        <div class="w-[250px] flex justify-center">
          <a
            :href="`data:image/png;base64,${qrData?.data.data.qrCodeBase64}`"
            download="organization-qr-code.png"
            rel="noopener"
            :aria-label="t('Download QR Code')"
            class="inline-flex items-center text-sm gap-2 mt-6 px-4 py-2.5 bg-[#29A679] text-white rounded-lg hover:bg-[#12B76A]/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M3 12.75V14.25C3 14.6478 3.15804 15.0294 3.43934 15.3107C3.72064 15.592 4.10218 15.75 4.5 15.75H13.5C13.8978 15.75 14.2794 15.592 14.5607 15.3107C14.842 15.0294 15 14.6478 15 14.25V12.75M5.25 8.25L9 12M9 12L12.75 8.25M9 12V3"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('Download QR Code') }}
          </a>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50 text-muted-foreground">
        <p class="text-sm">{{ t('error-occurred') }}</p>
      </div>
    </CardContent>
  </Card>
</template>
