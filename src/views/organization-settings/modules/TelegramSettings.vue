<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useConnectTelegramGroup } from '../query/useConnectTelegramGroup'
import { SendIcon, CopyIcon, ExternalLinkIcon, ClockIcon, CheckIcon, AlertCircleIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { computed } from 'vue'
import { formatDateTime } from '@/lib/utils'

const { t } = useI18n()
const { data, refetch, isFetching } = useConnectTelegramGroup()

const handleConnect = () => {
  refetch()
}

const telegramData = computed(() => data.value?.data)
const apiError = computed(() => data.value?.isSuccess === false ? data.value.error : null)

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t('copied'))
  } catch (err) {
    toast.error(t('error-occurred'))
  }
}

const formattedExpiry = computed(() => {
  if (!telegramData.value?.expiresAtUtc) return ''
  return formatDateTime(telegramData.value.expiresAtUtc)
})
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-4 mb-5 bg-gray-50 flex flex-row items-center justify-between">
      <div>
        <CardTitle class="text-lg font-semibold mb-0.5">{{ t('Telegram Bot') }}</CardTitle>
        <p class="text-sm text-muted-foreground">{{ t('Connect your organization to a Telegram group') }}</p>
      </div>
      <Button
        v-if="!telegramData && !apiError"
        @click="handleConnect"
        :disabled="isFetching"
        :loading="isFetching"
        class="shadow-none border-none inline-flex items-center justify-center text-sm gap-2 px-4 py-2.5 bg-[#29A679] text-white rounded-lg hover:bg-[#12B76A]/90 transition-colors"
      >
        <SendIcon class="w-4 h-4" />
        {{ t('Connect Group') }}
      </Button>
    </CardHeader>
    <CardContent>
      <div v-if="apiError" class="py-12 flex flex-col items-center justify-center text-center">
        <template v-if="apiError.code === 'TelegramAlreadyConnected'">
          <div class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckIcon class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">{{ t('ErrorCode.TelegramAlreadyConnected') }}</h3>
          <p class="text-gray-500 max-w-sm mt-1">
            {{ t('Your organization is already connected to a Telegram group. You can now use the bot in your group.') }}
          </p>
        </template>
        <template v-else>
          <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircleIcon class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">{{ t('error-occurred') }}</h3>
          <p class="text-gray-500 max-w-sm mt-1">
            {{ t(apiError.message || 'error.try-later') }}
          </p>
          <Button
            @click="handleConnect"
            class="mt-6 bg-[#29A679] hover:bg-[#12B76A]/90"
          >
            {{ t('try-again') }}
          </Button>
        </template>
      </div>

      <div v-else-if="telegramData" class="space-y-6">
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <h3 class="text-gray-900 font-semibold mb-2 flex items-center gap-2">
            <SendIcon class="w-5 h-5 text-[#29A679]" />
            {{ t('Connection Instructions') }}
          </h3>
          <ol class="list-decimal list-inside space-y-3 text-gray-700 text-sm">
            <li>
              {{ t('Click the button below to open the Telegram bot') }}
            </li>
            <li>
              {{ t('Add the bot to your desired Telegram group') }}
            </li>
            <li>
              {{ t('Send the following command in the group to complete the connection') }}:
            </li>
          </ol>

          <div class="mt-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
            <code class="flex-1 font-mono text-sm text-gray-900 break-all">{{ telegramData.command }}</code>
            <Button
              variant="ghost"
              size="sm"
              @click="copyToClipboard(telegramData.command)"
              class="text-[#29A679] hover:text-[#12B76A] hover:bg-green-50"
            >
              <CopyIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div v-if="telegramData.expiresAtUtc" class="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <ClockIcon class="w-4 h-4 text-orange-500" />
          <span>{{ t('This code expires at') }}: <strong>{{ formattedExpiry }}</strong></span>
        </div>

        <div class="flex flex-wrap gap-4">
          <a :href="telegramData.botLink" target="_blank" rel="noopener noreferrer" class="flex-1 min-w-[200px]">
            <Button class="w-full bg-[#29A679] hover:bg-[#12B76A]/90 text-white gap-3 h-12 rounded-xl shadow-none">
              <ExternalLinkIcon class="w-5 h-5" />
              {{ t('Open Telegram Bot') }}
            </Button>
          </a>
          
          <Button
            @click="handleConnect"
            variant="outline"
            :disabled="isFetching"
            :loading="isFetching"
            class="flex-1 min-w-[200px] h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 gap-2"
          >
            {{ t('Refresh Connection Code') }}
          </Button>
        </div>

        
      </div>

      <div v-else-if="!isFetching" class="py-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-gray-50 text-[#29A679] rounded-full flex items-center justify-center mb-4">
          <SendIcon class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">{{ t('No active connection request') }}</h3>
        <p class="text-gray-500 max-w-sm mt-1">
          {{ t('Click the button above to generate a connection link and command for your Telegram group.') }}
        </p>
      </div>

  <div v-else class="py-12 flex flex-col items-center justify-center text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29A679]"></div>
    <p class="mt-4 text-gray-500">{{ t('Generating connection details...') }}</p>
  </div>
    </CardContent>
  </Card>
</template>
