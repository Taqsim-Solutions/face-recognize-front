<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prettify } from '@/lib/utils'

defineProps<{
  title?: string
  data: {
    name: string
    color: string
    value: any
  }[]
}>()
</script>

<template>
  <Card class="text-sm">
    <CardHeader v-if="title" class="p-3 border-b">
      <CardTitle>
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-3 min-w-[180px] flex flex-col gap-1">
      <div v-for="(item, key) in data" :key="key" class="flex justify-between">
        <span>{{ prettify(item.value) }}</span>
      </div>
    </CardContent>
  </Card>
</template>
