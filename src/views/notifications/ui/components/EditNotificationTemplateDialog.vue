<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { toast } from 'vue-sonner'
import { useUpdateNotificationTemplate } from '../../query'
import { ref, watch } from 'vue'
import type { NotificationTemplate } from '../../types'

const props = defineProps<{
  template: NotificationTemplate
}>()

const { t } = useI18n()
const open = ref(false)

const getInitialLocales = (template: NotificationTemplate) => {
  const defaults = {
    uz: { title: '', message: '' },
    uzc: { title: '', message: '' },
    ru: { title: '', message: '' }
  }
  if (!template?.locales) return defaults

  const initial = JSON.parse(JSON.stringify(defaults))
  template.locales.forEach((l) => {
    if (Object.prototype.hasOwnProperty.call(initial, l.localeKey)) {
      initial[l.localeKey] = {
        title: l.title,
        message: l.message
      }
    }
  })
  return initial
}

const formSchema = toTypedSchema(
  z.object({
    locales: z.object({
      uz: z.object({
        title: z.string().min(1, { message: t('validation.required-field') }),
        message: z.string().min(1, { message: t('validation.required-field') })
      }),
      uzc: z.object({
        title: z.string().min(1, { message: t('validation.required-field') }),
        message: z.string().min(1, { message: t('validation.required-field') })
      }),
      ru: z.object({
        title: z.string().min(1, { message: t('validation.required-field') }),
        message: z.string().min(1, { message: t('validation.required-field') })
      })
    })
  })
)

const form = useForm({
  validationSchema: formSchema,
  keepValuesOnUnmount: true,
  initialValues: {
    locales: getInitialLocales(props.template)
  }
})

watch(
  () => props.template,
  (newVal) => {
    if (newVal) {
      form.setValues({
        locales: getInitialLocales(newVal)
      })
    }
  }
)

const { mutate: update, isPending } = useUpdateNotificationTemplate()

const availableLocales = ['uz', 'uzc', 'ru']

const onSubmit = form.handleSubmit((values) => {
  const localesArray = [
    { localeKey: 'uz', ...values.locales.uz },
    { localeKey: 'uzc', ...values.locales.uzc },
    { localeKey: 'ru', ...values.locales.ru }
  ]

  update(
    {
      id: props.template.id,
      data: {
        locales: localesArray,
        requiredArguments: props.template.requiredArguments || {}
      }
    },
    {
      onSuccess: () => {
        toast.success(t('notification-template-updated'))
        open.value = false
      },
      onError: () => {
        toast.error(t('error-occurred'))
      }
    }
  )
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger asChild>
      <div
        class="bg-blue-100 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3B82F6"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </div>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
      <div class="absolute right-3 top-3 z-10">
        <button
          @click="open = false"
          class="rounded-md hover:opacity-100 transition bg-white"
          aria-label="Close"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" />
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0" />
            <path
              d="M20 12L12 20M12 12L20 20"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <DialogHeader class="bg-gray-50 p-5 border-b border-border shrink-0">
        <DialogTitle>{{ t('edit-notification-template') }}</DialogTitle>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4 px-4 pb-5 overflow-y-auto flex-1 py-4">


        <!-- Locales with Tabs -->
        <div class="space-y-2">
          <Tabs defaultValue="uz" class="w-full">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
              <TabsTrigger value="uzc">Ўзбекча</TabsTrigger>
              <TabsTrigger value="ru">Русский</TabsTrigger>
            </TabsList>
            
            <TabsContent v-for="lang in availableLocales" :key="lang" :value="lang" class="space-y-4 mt-4 p-1">
              <FormField v-slot="{ componentField }" :name="`locales.${lang}.title`">
                <FormItem>
                  <FormLabel>{{ t('title') }} ({{ lang.toUpperCase() }})</FormLabel>
                  <FormControl>
                    <Input type="text" :placeholder="t('enter-title')" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :name="`locales.${lang}.message`">
                <FormItem>
                  <FormLabel>{{ t('message') }} ({{ lang.toUpperCase() }})</FormLabel>
                  <FormControl>
                    <Textarea :placeholder="t('enter-message')" v-bind="componentField" rows="4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter class="pt-4">
          <Button type="submit" :disabled="isPending">
            {{ t('save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
