<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from 'vue-sonner'
import { useCreateDepartment } from '../../query/useCreateDepartment'
import { ref } from 'vue'

const { t } = useI18n()
const open = ref(false)

const formSchema = toTypedSchema(
  z.object({
    name: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' })
  })
)

const form = useForm({
  validationSchema: formSchema
})

const { mutate: create, isPending } = useCreateDepartment()

const onSubmit = form.handleSubmit((values) => {
  create(
    { name: values.name },
    {
      onSuccess: () => {
        toast.success(t('department-created'))
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
          {{ t('add-department') }}
        </Button>
      </DialogTrigger>
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="open = false"
        class="absolute right-3 top-3 rounded-md hover:opacity-100 transition bg-white z-10"
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
      <DialogHeader class="bg-gray-50 p-5 border-b border-border">
        <DialogTitle>{{ t('create-department') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ 'Create a new department' }}
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit" class="space-y-4 px-4 pb-5">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>{{ t('name') }}</FormLabel>
            <FormControl>
              <Input
                type="text"
                :placeholder="t('enter-department-name')"
                v-bind="componentField"
                class="h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button type="submit" :disabled="isPending">
            {{ t('save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
