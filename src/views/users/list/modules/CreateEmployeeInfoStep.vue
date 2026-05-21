<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray, type FormContext } from 'vee-validate'
import { vMaska } from 'maska/vue'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cross1Icon } from '@radix-icons/vue'


import { step2Schema, type Step2FormValues } from './createEmployeeSchemas'

const { t } = useI18n()

const props = defineProps<{
  modelValue: Step2FormValues
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Step2FormValues): void
}>()

const formRef = ref<FormContext<Step2FormValues> | null>(null)
const isSyncingFromParent = ref(false)

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))



const initialValues = computed<Step2FormValues>(
  () =>
    Object.assign(
      {
        status: 'active',
        salary: '',
        percentAllowed: null,
        fte: 1,
        comment: '',
        cardNumbers: [{ value: '' }]
      },
      clone(props.modelValue)
    ) as Step2FormValues
)

const syncFromParent = () => {
  if (!formRef.value) return
  isSyncingFromParent.value = true
  formRef.value.resetForm({
    values: clone(initialValues.value)
  })
  nextTick(() => {
    isSyncingFromParent.value = false
  })
}

watch(
  () => props.modelValue,
  () => {
    syncFromParent()
  },
  { deep: true }
)

watch(
  () => formRef.value?.values,
  (newVal) => {
    if (!newVal || isSyncingFromParent.value) return
    emit('update:modelValue', clone(newVal as Step2FormValues))
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    syncFromParent()
  })
})

const validateStep = async () => {
  if (!formRef.value) return false
  const result = await formRef.value.validate()
  if (!result.valid) {
    return false
  }

  emit('update:modelValue', clone(formRef.value.values as Step2FormValues))
  return true
}

defineExpose({ validateStep })
</script>

<template>
  <Form
    ref="formRef"
    :initial-values="initialValues"
    :validation-schema="toTypedSchema(step2Schema)"
    :validate-on-blur="true"
    :validate-on-change="true"
    :validate-on-input="false"
    v-slot="{}"
  >
    <div class="flex flex-col gap-6 mt-7">
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>{{ t('status') }}</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue :placeholder="t('select-status')" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="active">{{ t('active') }}</SelectItem>
                <SelectItem value="blocked">{{ t('blocked') }}</SelectItem>
                <SelectItem value="leftTheCompany">{{ t('left-the-company') }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, errorMessage }" name="salary">
        <FormItem>
          <FormLabel>{{ t('salary') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="componentField"
                v-maska="{ mask: '############', tokens: { '#': { pattern: /[0-9]/ } } }"
                placeholder="1000000"
                class="tabular-nums h-10 px-4 pr-10 border border-gray-300 rounded-lg"
                :class="{ 'pr-10': errorMessage }"
                maxlength="12"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  if (input.value.length > 12) {
                    input.value = input.value.slice(0, 12)
                    componentField.onChange?.(input.value)
                  }
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, errorMessage }" name="percentAllowed">
        <FormItem>
          <FormLabel>{{ t('allowed-percent') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                type="number"
                v-bind="componentField"
                max="80"
                min="0"
                :placeholder="t('enter-allowed-percent')"
                class="tabular-nums h-10 px-4 pr-8 border border-gray-300 rounded-lg"
              />
              <div
                v-if="!errorMessage"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium select-none pointer-events-none"
              >
                %
              </div>
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, errorMessage }" name="fte">
        <FormItem>
          <FormLabel>{{ t('fte') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                type="number"
                step="0.05"
                max="3"
                min="0.1"
                class="tabular-nums h-10 px-4 border border-gray-300 rounded-lg"
                :class="{ 'pr-10': errorMessage }"
                v-bind="componentField"
                placeholder="1"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="comment">
        <FormItem>
          <FormLabel>{{ t('comment') }}</FormLabel>
          <FormControl>
            <Textarea
              class="tabular-nums h-10 px-4 pr-10 border border-gray-300 rounded-lg"
              v-bind="componentField"
              :placeholder="t('comment')"
            />
          </FormControl>
        </FormItem>
      </FormField>

      <div class="space-y-3">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{{ t('card-number') }}</label>
        <FieldArray name="cardNumbers" v-slot="{ fields, push, remove }">
          <div class="flex flex-col gap-3">
            <div v-for="(field, index) in fields" :key="field.key" class="group relative">
              <FormField
                :name="`cardNumbers.${index}.value`"
                v-slot="{ componentField, errorMessage }"
              >
                <FormItem class="w-full">
                  <FormControl>
                    <div class="relative flex items-center gap-2">
                      <div class="relative flex-1">
                        <Input
                          v-bind="componentField"
                          placeholder="1234567890123456"
                          maxlength="16"
                          class="tabular-nums h-10 px-4 pr-10 border border-gray-300 rounded-lg"
                          :class="{ 'pr-10': errorMessage }"
                          @input="(e: InputEvent) => {
                          const input = e.target as HTMLInputElement
                          const value = input.value.replace(/\D/g, '').slice(0, 16)
                          input.value = value
                          componentField.onChange?.(value)
                        }"
                        />
                        <TooltipProvider v-if="errorMessage" :delay-duration="0">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <div
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  class="h-5 w-5"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent class="bg-gray-900 text-white">
                              {{ t(errorMessage) }}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <Button
                        v-if="fields.length > 1"
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        @click="() => remove(index)"
                      >
                        <Cross1Icon class="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              class="w-full flex items-center justify-center gap-2 h-10 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"
              @click="() => push({ value: '' })"
            >
              <div class="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                <span class="text-lg leading-none mb-0.5">+</span>
              </div>
              {{ t('add-another-card') }}
            </Button>
          </div>
        </FieldArray>
      </div>
    </div>
  </Form>
</template>
