<script setup lang="ts">
import { useForm } from 'vee-validate'
import { ref, computed, provide, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Ref } from 'vue'

import { Button } from '@/components/ui/button'

type Props = {
  validationSchema: any
}

const props = defineProps<Props>()

const loading = inject('FORM_SUBMITTING') as Ref<boolean>

const { t } = useI18n()
const emit = defineEmits(['submit'])
const currentStepIdx = ref(0)

// Injects the starting step, child <form-steps> will use this to generate their ids
const stepCounter = ref(0)
provide('STEP_COUNTER', stepCounter)

// Inject the live ref of the current index to child components
// will be used to toggle each form-step visibility
provide('CURRENT_STEP_INDEX', currentStepIdx)

// if this is the last step
const isLastStep = computed(() => {
  return currentStepIdx.value === stepCounter.value - 1
})

// If the `previous` button should appear
const hasPrevious = computed(() => {
  return currentStepIdx.value > 0
})

// extracts the individual step schema
const currentSchema = computed(() => {
  return props.validationSchema[currentStepIdx.value]
})

const { handleSubmit, setFieldValue } = useForm({
  // vee-validate will be aware of computed schema changes
  validationSchema: currentSchema,

  // turn this on so each step values won't get removed when you move back or to the next step
  keepValuesOnUnmount: true
})
setFieldValue('phoneNumber', '+998')

// We are using the "submit" handler to progress to next steps
// and to submit the form if its the last step
const temp = {
  firstName: '',
  lastName: ''
}
const onSubmit = handleSubmit((values) => {
  if (!isLastStep.value) {
    temp.firstName = values.firstName
    temp.lastName = values.lastName
    currentStepIdx.value++
    return
  }

  // Let the parent know the form was filled across all steps
  emit('submit', { ...values, ...temp })
})

function goToPrev() {
  if (currentStepIdx.value === 0) {
    return
  }

  currentStepIdx.value--
}
</script>

<template>
  <form @submit="onSubmit">
    <slot />

    <div class="mt-6 flex items-center justify-between gap-x-4">
      <Button v-if="hasPrevious" type="button" variant="secondary" class="w-full" @click="goToPrev">
        {{ t('back') }}
      </Button>
      <Button type="submit" :loading="loading" class="w-full">
        {{ isLastStep ? `${t('auth.sign-up-end-label')} 😊` : t('auth.sign-up-start-label') }}
      </Button>
    </div>
  </form>
</template>
