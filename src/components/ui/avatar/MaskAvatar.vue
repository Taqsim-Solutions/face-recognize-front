<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: '100%'
})

// Curated list of beautiful, vibrant gradients
const gradients = [
  ['#4158D0', '#C850C0', '#FFCC70'],
  ['#0093E9', '#80D0C7'],
  ['#8EC5FC', '#E0C3FC'],
  ['#D9AFD9', '#97D9E1'],
  ['#FBAB7E', '#F7CE68'],
  ['#85FFBD', '#FFFB7D'],
  ['#FF9A9E', '#FECFEF'],
  ['#FA8BFF', '#2BD2FF', '#2BFF88'],
  ['#FF3CAC', '#784BA0', '#2B86C5'],
  ['#21D4FD', '#B721FF'],
  ['#3EECAC', '#EE74E1'],
  ['#00DBDE', '#FC00FF'],
  ['#52ACFF', '#FFE32C'],
  ['#FFE53B', '#FF2525'],
  ['#FAACA8', '#DDD6F3']
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

const gradientColors = computed(() => getGradient(props.name))
const initials = computed(() => {
  const parts = props.name.trim().split(' ')
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

const uniqueId = computed(() => `mask-avatar-${props.name.replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 9)}`)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient :id="uniqueId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop 
          v-for="(color, index) in gradientColors" 
          :key="index" 
          :offset="`${(index / (gradientColors.length - 1)) * 100}%`" 
          :stop-color="color" 
        />
      </linearGradient>
    </defs>
    
    <rect width="100" height="100" :fill="`url(#${uniqueId})`" />
    
    <text
      x="50"
      y="47"
      dy=".1em"
      dominant-baseline="central"
      text-anchor="middle"
      fill="white"
      font-size="40"
      font-weight="600"
      font-family="'Inter', sans-serif"
      style="text-shadow: 0 2px 4px rgba(0,0,0,0.1);"
    >
      {{ initials }}
    </text>
  </svg>
</template>
