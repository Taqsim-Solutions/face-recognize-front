<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import RegisterForm from '../modules/RegisterForm.vue'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="w-full px-8">
    <div class="flex items-center justify-center h-full">
      <div>
        <div>
          <h2
            class="text-foreground mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center"
          >
            {{ t('auth.create-account') }}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground text-center">
            {{ t('auth.sign-up-desc') }}
          </p>
        </div>

        <div class="mt-4">
          <RegisterForm />
        </div>

        <div class="mt-4 flex items-center gap-x-1">
          <span class="block h-px w-full bg-muted-foreground/50 mx-1"></span>
          <p class="text-muted-foreground">{{ t('or') }}</p>
          <span class="block h-px w-full bg-muted-foreground/50 mx-1"></span>
        </div>

        <Button variant="outline" class="w-full mt-4" @click="() => router.push({ name: 'login' })">
          {{ t('auth.sign-in-existing-acc') }}
        </Button>
      </div>
    </div>
  </div>
</template>
