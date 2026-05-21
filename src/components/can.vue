<template>
  <slot v-if="hasPermission" />
  <slot v-else-if="isLoading" name="loading" />
</template>

<script setup lang="ts">
import { useCheckPermission } from '@/composables/useCheckPermission'

interface Props {
  i: string
}

defineOptions({
  name: 'Can'
})

const props = defineProps<Props>()

const { hasPermission, isLoading } = useCheckPermission(props.i)
</script>
