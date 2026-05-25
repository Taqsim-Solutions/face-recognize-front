<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { useI18n } from 'vue-i18n'
import { computed, watch } from 'vue'

const { locale } = useI18n()

const isRTL = computed(() => ['ps', 'ur'].includes(locale.value))

watch(isRTL, (rtl) => {
  document.documentElement.dir = rtl ? 'rtl' : 'ltr'
  document.documentElement.lang = locale.value
}, { immediate: true })
</script>

<template>
  <Toaster position="top-center" richColors />
  <RouterView />
</template>
