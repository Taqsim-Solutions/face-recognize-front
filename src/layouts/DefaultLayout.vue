<script setup lang="ts">
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { usePermissions } from '@/api/usePermissions'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { WifiOff } from 'lucide-vue-next'

const { t } = useI18n()
const sidebarState = useStorage('sidebar', 'expanded')

const { isError, isFetching, refetch } = usePermissions()

const handleRetry = () => {
  refetch()
}

const forceReload = () => {
  window.location.reload()
}

onMounted(() => {
  if (window.innerWidth < 1024 && sidebarState.value === 'expanded') {
    sidebarState.value = 'collapsed'
  }
})
</script>

<template>
  <!-- Full Screen Connection Error Fallback (100vh Height) -->
  <div v-if="isError" class="min-h-screen h-screen w-screen flex items-center justify-center p-4 bg-[#F7F9FB] select-none relative overflow-hidden">
    <!-- Faint premium mesh gradient background details for depth -->
    <div class="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[#29A679]/5 blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none"></div>

    <div class="relative bg-white border border-[#E0E6F0] rounded-2xl p-10 max-w-md w-full shadow-[0_12px_40px_rgba(16,24,40,0.03)] flex flex-col items-center text-center transition-all duration-300">
      
      <!-- Premium Overlay Loader when refetching is in progress -->
      <div v-if="isFetching" class="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10 transition-all duration-300">
        <div class="relative flex items-center justify-center mb-4">
          <!-- Double concentric spinner for premium feel -->
          <div class="absolute w-12 h-12 rounded-full border-2 border-[#E0E6F0]"></div>
          <div class="w-12 h-12 rounded-full border-2 border-transparent border-t-[#29A679] animate-spin"></div>
        </div>
        <p class="text-sm font-semibold text-[#101828] animate-pulse">{{ t('loading') }}...</p>
      </div>
      
      <!-- Premium Disconnected Icon with dual-ring pulsing animation -->
      <div class="relative flex items-center justify-center mb-6">
        <div class="absolute inset-0 rounded-full bg-rose-500/10 animate-ping opacity-75 duration-1000"></div>
        <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-rose-50 to-rose-100/50 border border-rose-200/60 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(244,63,94,0.04)]">
          <WifiOff class="w-7 h-7 text-rose-500 stroke-[2]" />
        </div>
      </div>
      
      <!-- Error Status Indicator Badge -->
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-600 border border-rose-100 mb-5">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        {{ t('error.occurred') }}
      </span>
      
      <!-- Typography in Harmony with Design System -->
      <h3 class="text-2xl font-bold tracking-tight text-[#101828] mb-3">
        {{ t('error.connection-failed') }}
      </h3>
      
      <p class="text-[#596881] text-sm leading-relaxed mb-8 max-w-[320px]">
        {{ t('error.connection-failed-desc') }}
      </p>
      
      <!-- Actions using Brand Color Gradients & Shadows -->
      <div class="w-full space-y-3">
        <Button
          variant="default"
          class="w-full h-11 rounded-lg bg-gradient-to-r from-[#29A679] to-[#208a63] hover:from-[#208a63] hover:to-[#1b7554] text-white font-medium shadow-[0_4px_12px_rgba(41,166,121,0.15)] hover:shadow-[0_6px_16px_rgba(41,166,121,0.25)] transition-all duration-200 flex items-center justify-center gap-2"
          :loading="isFetching"
          @click="handleRetry"
        >
          {{ t('try-again') }}
        </Button>
        
        <Button
          variant="outline"
          class="w-full h-11 rounded-lg border-[#E0E6F0] bg-white text-[#596881] hover:text-[#101828] hover:bg-[#F7F9FB] hover:border-[#8796AF] font-medium transition-all duration-200"
          @click="forceReload"
        >
          {{ t('error.force-reload') }}
        </Button>
      </div>
    </div>
  </div>
  
  <!-- Main Application Layout -->
  <div v-else class="lg:flex relative text-base">
    <Sidebar class="row-span-full" :state="sidebarState" />
    <main class="antialiased grid grid-rows-[auto_1fr] flex-1">
      <Header :sidebar-state="sidebarState" />
      
      <!-- Main Content View -->
      <div class="overflow-x-auto py-3">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </main>
  </div>
</template>

