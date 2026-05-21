<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useGetAccountInfo } from '../queries/useGetAccountInfo'
import { useI18n } from 'vue-i18n'
import { prettifyPhoneNumber } from '@/lib/utils'
import { useQuery } from '@tanstack/vue-query'
import { getAccountImg } from '../api'
import { MaskAvatar } from '@/components/ui/avatar'

const { t } = useI18n()

const { data, isLoading, error } = useGetAccountInfo()
const accountImgId = computed(() => data.value?.images.find((i: any) => i.type === 'avatar')?.id || '')
const isAccountImgEnabled = computed(() => !!accountImgId.value)

const { data: accountImg } = useQuery({
  queryKey: ['account-img', accountImgId],
  queryFn: () => getAccountImg(accountImgId.value),
  enabled: isAccountImgEnabled
})

const accountImageSrc = ref<string>()
watch(accountImg, (blob) => {
  if (blob && blob.data) {
    // If server returned blob, create preview URL
    accountImageSrc.value = URL.createObjectURL(blob.data)
    return
  }
})

const fullName = computed(() => {
  if (!data.value) return ''
  return `${data.value.firstName || ''} ${data.value.lastName || ''}`.trim()
})

// Keep accountImageSrc in sync: prefer server image -> uploaded
watch(
  () => accountImg.value,
  () => {
    if (accountImg.value && accountImg.value.data) {
      accountImageSrc.value = URL.createObjectURL(accountImg.value.data)
    }
  }
)
</script>

<template>
  <div class="p-6 max-w-4xl">
    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-6">
      <div class="h-32 w-full rounded-2xl bg-muted animate-pulse" />
      <div class="flex items-center gap-6">
        <div class="w-24 h-24 rounded-full bg-muted animate-pulse" />
        <div class="space-y-3 w-1/2">
          <div class="h-5 rounded bg-muted animate-pulse" />
          <div class="h-4 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="h-20 rounded-xl bg-muted animate-pulse" />
        <div class="h-20 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
      {{ error }}
    </div>

    <!-- Profile Content -->
    <div v-else-if="data" class="space-y-10">

      <div class="flex items-end gap-6 px-4">
        <!-- Avatar with custom upload -->
        <div class="relative w-32 h-32 group">
          <div class="relative w-full h-full rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
            <template v-if="accountImageSrc">
              <img
                :src="accountImageSrc"
                alt="avatar"
                class="w-full h-full rounded-full object-cover"
              />
            </template>
            <template v-else>
              <MaskAvatar :name="fullName" class="w-full h-full" />
            </template>
          </div>
        </div>

        <!-- Name + Role -->
        <div class="pb-2">
          <p class="text-3xl font-bold leading-tight tracking-tight">
            {{ data.firstName }} {{ data.lastName }}
          </p>
          <span class="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-muted text-foreground/70">
            {{ data.roles?.[0] || t('role') }}
          </span>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        <div class="rounded-xl border bg-card p-5 shadow-sm transition duration-200">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">{{ t('phone-number') }}</p>
          <p class="mt-2 text-lg font-medium">{{ prettifyPhoneNumber(data.phoneNumber) }}</p>
        </div>

        <div class="rounded-xl border bg-card p-5 shadow-sm transition duration-200">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
          <p class="mt-2 text-lg font-medium">{{ data.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.45s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
