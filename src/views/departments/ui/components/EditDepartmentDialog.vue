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
import { useUpdateDepartment } from '../../query/useUpdateDepartment'
import { ref, watch } from 'vue'

interface Props {
  department: {
    id: string
    name: string
  }
}

const props = defineProps<Props>()
const { t } = useI18n()
const open = ref(false)

const formSchema = toTypedSchema(
  z.object({
    name: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' })
  })
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: props.department.name
  }
})

watch(
  () => props.department,
  (newVal) => {
    form.setValues({
      name: newVal.name
    })
  },
  { deep: true }
)

watch(open, (val) => {
  if (val) {
    form.setFieldValue('name', props.department.name)
  }
})

const { mutate: update, isPending } = useUpdateDepartment()

const onSubmit = form.handleSubmit((values) => {
  update(
    { id: props.department.id, data: { name: values.name } },
    {
      onSuccess: () => {
        toast.success(t('department-updated'))
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
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="bg-[#E9F9F2] hover:bg-[#E9F9F2] hover:opacity-80 transition-all border-none px-[8px] h-7"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.00033 4.33341L11.667 7.00008M2.66699 13.3335H5.33366L12.3337 6.33345C12.6873 5.97983 12.8859 5.50022 12.8859 5.00012C12.8859 4.50002 12.6873 4.02041 12.3337 3.66679C11.98 3.31316 11.5004 3.1145 11.0003 3.1145C10.5002 3.1145 10.0206 3.31316 9.66699 3.66679L2.66699 10.6668V13.3335Z" stroke="#15803D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
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
        <DialogTitle>{{ t('edit-department') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ 'Edit department details' }}
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
