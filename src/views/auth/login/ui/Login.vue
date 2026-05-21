<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoginForm from '../modules/LoginForm.vue'
import logo from '@/assets/logo.svg'

const { t } = useI18n()
</script>

<template>
  <div class="w-full px-8">
    <div class="flex items-center justify-center h-full">
      <div>
        <div>
          <img :src="logo" alt="Taqsim Oylik" class="w-14" />
          <h2
            class="text-foreground mt-8 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
          >
            {{ t('auth.sign-in-label') }}
          </h2>
          <p class="mt-1 text-base text-grayx1">
            {{ t('auth.sign-in-desc') }}
          </p>
        </div>

        <div class="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
