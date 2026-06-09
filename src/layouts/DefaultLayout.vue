<script setup lang="ts">
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'

const sidebarState = useStorage('sidebar', 'expanded')

onMounted(() => {
  if (window.innerWidth < 1024 && sidebarState.value === 'expanded') {
    sidebarState.value = 'collapsed'
  }
})
</script>

<template>
  <!-- Main Application Layout -->
  <div class="lg:flex relative text-base">
    <!-- Mobile backdrop — tap to close the sidebar -->
    <div
      v-if="sidebarState === 'expanded'"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="sidebarState = 'collapsed'"
    />

    <Sidebar class="row-span-full" :state="sidebarState" />
    <main class="antialiased grid grid-rows-[auto_1fr] flex-1 min-w-0">
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

