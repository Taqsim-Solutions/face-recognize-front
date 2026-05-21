<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { utils, writeFile } from 'xlsx'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-vue-next'
import { fetchPayments } from '../api'
import dayjs from 'dayjs'

const props = defineProps<{
  params: {
    page?: number
    size?: number
    fromCreatedAt?: string
    toCreatedAt?: string
  }
}>()

const { t } = useI18n()
const loading = ref(false)

const handleDownload = async () => {
  loading.value = true
  try {
    const res = await fetchPayments({
      ...props.params,
      page: 1,
      isAll: true
    })

    const data = res.data?.data || []

    const formattedData = data.map((item: any, index: number) => ({
      '№': index + 1,
      [t('paymentNumber')]: item.paymentNumber || '—',
      [t('amount')]: item.amount ? item.amount : '0',
      [t('paid')]: item.paid ? item.paid : '0',
      [t('commission')]: item.commission ? item.commission : '0',
      [t('date')]: item.createdAt ? dayjs(item.createdAt).format('DD.MM.YYYY HH:mm:ss') : '—',
      [t('paymentType')]: item.paymentType ? t(item.paymentType) : '—',
      [t('full-name')]: `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || '—',
      [t('phone-number')]: item.user?.phoneNumber ? `+${item.user.phoneNumber}` : '—',
      'PINFL': item.pinfl || '—',
      [t('card-number')]: item.card?.maskedNumber || '—',
      [t('provider')]: item.salaryRequest?.provider || '—',
      [`OFD ${t('terminal-id')}`]: item.salaryPaymentOFD?.terminalID || '—',
      [`OFD ${t('date')}`]: item.salaryPaymentOFD?.dateTime || '—',
      [`OFD ${t('fiscal-sign') || 'Fiscal Sign'}`]: item.salaryPaymentOFD?.fiscalSign || '—',
      [`OFD ${t('qr-code')}`]: item.salaryPaymentOFD?.qrCodeURL || '—'
    }))

    const worksheet = utils.json_to_sheet(formattedData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "To'lovlar")
    writeFile(workbook, 'Tolovlar.xlsx', { compression: true })
  } catch (error) {
    console.error('Download failed', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Button
    :loading="loading"
    @click="handleDownload"
    class="bg-primary flex border-none text-white rounded-lg h-[35px] hover:bg-primary hover:text-white hover:opacity-85 transition-all"
  >
    <DownloadIcon :size="16" class="mr-2" /> {{ t('download') }}
  </Button>
</template>
