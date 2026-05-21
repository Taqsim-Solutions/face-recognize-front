<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { LoaderCircleIcon } from 'lucide-vue-next'

import { Primitive, type PrimitiveProps } from 'radix-vue'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '@/lib/utils'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :disabled="props.loading"
  >
    <LoaderCircleIcon v-if="loading" class="animate-spin" :class="{ 'mr-2': size !== 'icon' }" />
    <slot v-if="(size !== 'icon' && loading) || !loading" />
  </Primitive>
</template>
