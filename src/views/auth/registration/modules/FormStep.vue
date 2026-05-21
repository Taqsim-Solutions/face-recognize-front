<script setup lang="ts">
import { computed, inject, type Ref } from "vue";

// This is a ref injected from FormWizard
// clones the step index to get the step's index and advances it by 1 for the next step
// meaning each step gets an index id starting from 1
const currentIdx = (inject("STEP_COUNTER") as Ref<number>).value++;
// Grabs the live ref to the current form active step
const formStepIdx = inject("CURRENT_STEP_INDEX") as Ref<number>;

// If this step should be shown
const shouldShow = computed(() => {
  return currentIdx === formStepIdx.value;
});
</script>

<template>
  <div v-if="shouldShow">
    <slot />
  </div>
</template>
