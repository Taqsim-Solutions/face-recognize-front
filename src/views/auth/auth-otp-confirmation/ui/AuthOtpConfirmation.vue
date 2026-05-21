<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue-sonner'

import AuthOPTForm from '../modules/AuthOPTForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const requestId = route.params.id as string

const isResending = ref(false)
const cooldownTime = ref(120) // 2-minute cooldown on page load
const cooldownInterval = ref<NodeJS.Timeout | null>(null)

const startCooldown = () => {
  cooldownInterval.value = setInterval(() => {
    if (cooldownTime.value > 0) {
      cooldownTime.value--
    } else {
      if (cooldownInterval.value) {
        clearInterval(cooldownInterval.value)
        cooldownInterval.value = null
      }
    }
  }, 1000)
}

const formattedCooldown = computed(() => {
  const min = Math.floor(cooldownTime.value / 60)
  const sec = cooldownTime.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

const handleResendCode = async () => {
  if (cooldownTime.value > 0) return

  try {
    isResending.value = true
    const { status } = await axios.post('/api/auth/resend-otp', { requestId })

    if (status === 200) {
      toast.success(t('code-resent-successfully'))
      cooldownTime.value = 120
      startCooldown()
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      toast.error(t('error-occurred'))
    }
  } finally {
    isResending.value = false
  }
}

// Start 3-minute countdown immediately when user lands
onMounted(() => {
  startCooldown()
})

onUnmounted(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
})
</script>

<template>
  <div class="w-full px-8">
    <div class="flex items-center justify-center h-full">
      <div>
        <Button variant="ghost" class="w-10 h-10 p-0" @click="() => router.push({ name: 'login' })">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
          >
            <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="white" />
            <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#E0E6F0" />
            <path
              d="M14.75 20H25.25M14.75 20L17.75 23M14.75 20L17.75 17"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
        <!-- Title -->
        <div class="text-left">
          <h2
            class="text-foreground mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center"
          >
            {{ t('auth.sign-in-label') }}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground text-center">
            {{ t('enter-the-code-you-received') }}
          </p>
        </div>

        <!-- OTP Form -->
        <div class="mt-4">
          <AuthOPTForm :request-id="requestId" />
        </div>

        <!-- Resend Button -->
        <div class="mt-4">
          <Button
            variant="ghost"
            class="w-full"
            :disabled="isResending || cooldownTime > 0"
            @click="handleResendCode"
          >
            {{ cooldownTime > 0 ? `${t('resend-code')} (${formattedCooldown})` : t('resend-code') }}
          </Button>
        </div>

        <!-- Divider -->
        <div class="mt-4 flex items-center gap-x-1">
          <span class="block h-px w-full bg-muted-foreground/50 mx-1"></span>
          <p class="text-muted-foreground">{{ t('or') }}</p>
          <span class="block h-px w-full bg-muted-foreground/50 mx-1"></span>
        </div>

        <!-- Back Button -->
        <Button variant="outline" class="w-full mt-4" @click="() => router.push({ name: 'login' })">
          {{ t('back-to-sign-in') }}
        </Button>
      </div>
    </div>
  </div>
</template>
