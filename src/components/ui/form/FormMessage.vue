<script lang="ts" setup>
import { ErrorMessage } from 'vee-validate'
import { toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormField } from './useFormField'

const { t } = useI18n()
const { name, formMessageId } = useFormField()
</script>

<template>
  <ErrorMessage
    :id="formMessageId"
    as="p"
    :name="toValue(name)"
    class="text-[0.8rem] font-medium text-destructive"
    v-slot="{ message }"
  >
    {{ message && t(message) }}
  </ErrorMessage>
</template>
