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
import { useCreateNotificationTemplate } from '../../query'
import { ref } from 'vue'

const { t } = useI18n()
const open = ref(false)

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

    locales: {
      uz: { title: '', message: '' },
      uzc: { title: '', message: '' },
      ru: { title: '', message: '' }
    }
  }
})

const { mutate: create, isPending } = useCreateNotificationTemplate()



const availableLocales = ['uz', 'uzc', 'ru']

const onSubmit = form.handleSubmit((values) => {
  const localesArray = [
    { localeKey: 'uz', ...values.locales.uz },
    { localeKey: 'uzc', ...values.locales.uzc },
    { localeKey: 'ru', ...values.locales.ru }
  ]

  create(
    {
      type: 'other',
      locales: localesArray,
      requiredArguments: {}
    },
    {
      onSuccess: () => {
        toast.success(t('notification-template-created'))
        open.value = false
        form.resetForm()
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
      <Button
        variant="outline"
        class="bg-[#29A679] flex gap-1 border-none text-white rounded-lg h-9 hover:bg-primary hover:text-white hover:opacity-85 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
          <path
            d="M7.99992 3.33325V12.6666M3.33325 7.99992H12.6666"
            stroke="white"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ t('create-template') }}
      </Button>
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
        <DialogTitle>{{ t('create-notification-template') }}</DialogTitle>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4 px-4 pb-5 overflow-y-auto flex-1 by-4">


        <!-- Locales with Tabs -->
        <div class="space-y-2 !mt-6">
           <Tabs defaultValue="uz" class="w-full">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
              <TabsTrigger value="uzc">Ўзбекча</TabsTrigger>
              <TabsTrigger value="ru">Русский</TabsTrigger>
            </TabsList>
            
            <TabsContent v-for="lang in availableLocales" :key="lang" :value="lang" class="space-y-4 mt-4 p-1">
              <FormField v-slot="{ componentField }" :name="`locales.${lang}.title`">
                <FormItem>
                  <FormLabel>{{ t('title') }} ({{ lang.toUpperCase() }}) <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="text" :placeholder="t('enter-title')" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :name="`locales.${lang}.message`">
                <FormItem>
                  <FormLabel>{{ t('message') }} ({{ lang.toUpperCase() }}) <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea :placeholder="t('enter-message')" v-bind="componentField" rows="4" />
                  </FormControl>
                   <!-- <p class="text-xs text-muted-foreground">{{ t('message-desc-placeholders') }}</p> -->
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
