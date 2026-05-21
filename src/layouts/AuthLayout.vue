<script setup lang="ts">
import bgAuth from '@/assets/bg.png'
</script>


<template>
  <div class="relative h-full">
    <img :src="bgAuth" class="absolute inset-0 w-full h-full object-cover" alt="" />
    <main class="flex justify-center items-center min-h-screen antialiased relative">
      <div class="relative h-[100vh] flex flex-col justify-center items-center bg-white h-auto py-10 rounded-2xl lg:max-auto mx-5">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
