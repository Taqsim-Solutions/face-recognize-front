<script setup lang="ts">
import type { OrganizationModel } from '../types'
import { computed, toRefs } from 'vue'

import { useI18n } from 'vue-i18n'
import { useDateFormat } from '@vueuse/core'
import { prettifyPhoneNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { InfoIcon } from 'lucide-vue-next'

const { t } = useI18n()
const props = defineProps<{
  data: OrganizationModel
}>()

const { data } = toRefs(props)

type DetailKey = keyof Pick<OrganizationModel, 'ifut' | 'dbibt' | 'thsht' | 'tin'>

const detailsFields: { label: string; key: DetailKey; desc: string }[] = [
  { label: 'ifut', key: 'ifut', desc: 'ifut-desc' },
  { label: 'dbibt', key: 'dbibt', desc: 'dbibt-desc' },
  { label: 'thsht', key: 'thsht', desc: 'thsht-desc' },
  { label: 'tin', key: 'tin', desc: 'tin-desc' }
]

const formattedDate = useDateFormat(
  computed(() => data.value.registeredAt),
  'DD.MM.YYYY'
)

const formattedPhone = computed(() =>
  data.value.phone ? prettifyPhoneNumber(data.value.phone) : t('not-provided')
)

const displayRegisteredDate = computed(() =>
  data.value.registeredAt ? formattedDate.value : t('not-provided')
)
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none overflow-hidden">
    <CardHeader class="border-b pt-7 mb-6 text-lg bg-gray-50">
      <CardTitle class="font-semibold">{{ t('organization details') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('settings-details-desc') }}</p>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-1 gap-5">
        <div class="grid grid-cols-2">
          <p class="font-medium text-gray-500">{{ t('organization-title') }}</p>
          <p class="font-semibold">{{ data.name }}</p>
        </div>
        <div class="grid grid-cols-2">
          <p class="font-medium text-gray-500">{{ t('phone-number') }}</p>
          <p class="font-semibold">{{ formattedPhone }}</p>
        </div>
        <div class="grid grid-cols-2">
          <p class="font-medium text-gray-500">{{ t('registered-date') }}</p>
          <p class="font-semibold">{{ displayRegisteredDate }}</p>
        </div>

        <div v-for="field in detailsFields" :key="field.key" class="grid grid-cols-2">
          <div class="font-medium text-gray-500 flex items-center">
            {{ t(field.label) }}
            <Popover>
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="ml-1 text-muted-foreground hover:text-slate-900 transition-colors"
                  :aria-label="t(field.label) + ' info'"
                >
                  <InfoIcon :size="16" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                <p class="text-xs">{{ t(field.desc) }}</p>
              </PopoverContent>
            </Popover>
          </div>
          <p class="font-semibold">
            {{ data[field.key] || t('not-provided') }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

