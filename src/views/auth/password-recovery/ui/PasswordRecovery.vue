<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import EmailForm from '../modules/EmailForm.vue'
import RecoveryForm from '../modules/RecoveryForm.vue'

const { t } = useI18n()
const router = useRouter()

const showRecoveryForm = ref(false)
const email = ref('')

const handleOtpRequested = (reqEmail: string) => {
  email.value = reqEmail
  showRecoveryForm.value = true
}

const handleBack = () => {
  showRecoveryForm.value = false
  email.value = ''
}
</script>

<template>
  <div class="w-full px-12">
    <div class="flex items-center justify-center h-full">
      <div>
        <div>
          <Button
            variant="ghost"
            class="w-10 h-10 p-0"
            @click="() => router.push({ name: 'login' })"
          >
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
          <h2
            class="text-foreground mt-6 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
          >
            {{ t('auth.password-recovery-label') }}
          </h2>
          <p class="mt-1 text-base text-grayx1">
            {{
              !showRecoveryForm
                ? t('auth.password-recovery-desc')
                : t('auth.enter-otp-and-new-password')
            }}
          </p>
        </div>

        <div class="mt-6">
          <EmailForm v-if="!showRecoveryForm" @otp-requested="handleOtpRequested" />
          <RecoveryForm
            v-else
            :email="email"
            @back="handleBack"
          />
        </div>

        <p class="mt-4 text-secondary-foreground text-sm flex justify-center gap-x-1">
          {{ t('auth.Did you remember your password?') }}
          <RouterLink :to="{ name: 'login' }" class="text-[#12B76A]">
            {{ t('auth.Back to login') }}
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
