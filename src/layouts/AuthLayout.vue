<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import heroDashboard from '@/assets/login-bg.png'

const { t } = useI18n()

const currentSlide = ref(0)
const slides = [
  {
    label: 'payday-first-motto-label',
    desc: 'payday-first-motto-desc'
  },
  {
    label: 'payday-second-motto-label',
    desc: 'payday-second-motto-desc'
  },
  {
    label: 'payday-third-motto-label',
    desc: 'payday-third-motto-desc'
  }
]

let intervalId: any

const goToSlide = (index: number) => {
  currentSlide.value = index
  resetInterval()
}

const resetInterval = () => {
  if (intervalId) window.clearInterval(intervalId as number)
  intervalId = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 5000)
}

onMounted(() => {
  resetInterval()
})

onUnmounted(() => {
  if (intervalId) window.clearInterval(intervalId as number)
})
</script>

<template>
  <main class="grid lg:grid-cols-2 justify-center items-center min-h-screen antialiased relative">
    <div class="relative h-[100vh] flex flex-col justify-center items-center">
      <RouterView />
    </div>

    <div
      class="relative w-full h-full hidden lg:flex flex-col items-start p-12 text-white bg-gradient-to-b from-[#10141F] via-[#151A29] to-[#2D384C] overflow-hidden"
    >
      <transition name="fade" mode="out-in">
        <div :key="currentSlide" class="relative z-10">
          <h2 class="text-4xl font-bold mb-2 leading-tight">
            {{ t(slides[currentSlide].label) }}
          </h2>
          <p class="text-lg text-white/70 max-w-xl font-normal mb-5">
            {{ t(slides[currentSlide].desc) }}
          </p>
        </div>
      </transition>

      <!-- Slider controllers -->
      <div class="flex gap-2 mt-6 z-10">
        <button
          v-for="(_, index) in slides"
          :key="index"
          @click="goToSlide(index)"
          :class="[
            'w-5 h-1.5 rounded-full transition-all duration-100',
            currentSlide === index ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/70'
          ]"
        ></button>
      </div>

      <img
        :src="heroDashboard"
        alt="App dashboard preview"
        class="absolute bottom-0 right-0 w-[60%] max-w-[650px] rounded-2xl"
      />
    </div>
  </main>
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
