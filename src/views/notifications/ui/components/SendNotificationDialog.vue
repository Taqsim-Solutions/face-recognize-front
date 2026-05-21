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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import { useInitializeNotificationEmployees, useGetNotificationTemplates, usePushNotification, useInitializeNotification } from '../../query'
import { useGetDepartments } from '@/views/departments/query'
import { useCheckPermission } from '@/composables/useCheckPermission'
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  userIds?: string[]
  open?: boolean
}>(), {
  userIds: () => [],
  open: undefined
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t, locale } = useI18n()
const internalOpen = ref(false)

const isOpen = computed({
  get: () => props.open !== undefined ? props.open : internalOpen.value,
  set: (val) => {
    internalOpen.value = val
    emit('update:open', val)
  }
})

// Update watcher to use isOpen
watch(isOpen, (val) => {
  if (!val) {
    setTimeout(() => {
      pushType.value = 'firebase'
      isProcessing.value = false
      form.resetForm()
    }, 300)
  }
})

// Update closeDialog
const closeDialog = () => {
  isOpen.value = false
}
const pushType = ref<string>('firebase')
const { hasPermission: canSendSms } = useCheckPermission('send.s.m.s.notifications')

const { data: templatesData } = useGetNotificationTemplates(ref({ page: 1, size: 100 }))
const templates = computed(() => (templatesData.value?.data?.data || []).filter((t: any) => t.state === 'active'))

const { data: departmentsData } = useGetDepartments(ref({ isAll: true }))
const departments = computed(() => departmentsData.value?.data?.data || [])

const formSchema = toTypedSchema(
  z.object({
    templateId: z.coerce.number().min(1, { message: t('validation.required-field') }),
    departmentId: z.string().optional()
  })
)

const form = useForm({
  validationSchema: formSchema
})

const { mutate: initializeEmployees, isPending: isInitializingEmployees } = useInitializeNotificationEmployees()
const { mutate: initializeUsers, isPending: isInitializingUsers } = useInitializeNotification()
const { mutate: push, isPending: isPushing } = usePushNotification()

watch(templates, (newTemplates) => {
  if (newTemplates.length > 0 && !form.values.templateId) {
    form.setFieldValue('templateId', Number(newTemplates[0].id))
  }
}, { immediate: true })


const isProcessing = ref(false)
const isInitializing = computed(() => isInitializingEmployees.value || isInitializingUsers.value)
const isSubmitting = computed(() => isInitializing.value || isPushing.value || isProcessing.value)

const handleError = () => {
  isProcessing.value = false
  toast.error(t('error-occurred'))
}

const onSubmit = form.handleSubmit((values) => {
  if (isSubmitting.value) return
  isProcessing.value = true

  const performPush = (id: string) => {
    push(
      {
        id,
        push: pushType.value
      },
      {
        onSuccess: () => {
          toast.success(t('notification-sent-successfully'))
          closeDialog()
          // We don't reset isProcessing to false here because the dialog is closing
          // and we want to keep it disabled until it's fully gone.
          // Reset happens on close via the watcher.
        },
        onError: () => {
          isProcessing.value = false
          toast.error(t('error-occurred'))
        }
      }
    )
  }

  const handleInitSuccess = (res: any) => {
    if (res?.data?.data) {
      performPush(res.data.data)
    } else {
      isProcessing.value = false
      toast.error(t('error-occurred'))
    }
  }

  if (props.userIds && props.userIds.length > 0) {
    // Send to specific users
    initializeUsers({
      templateId: Number(values.templateId),
      receiverIds: props.userIds,
      arguments: {}
    }, {
      onSuccess: handleInitSuccess,
      onError: handleError
    })
  } else {
    // Send to department or all
    const deptId = values.departmentId === 'all' || !values.departmentId ? undefined : values.departmentId
    initializeEmployees(
      {
        templateId: Number(values.templateId),
        departmentId: deptId,
        arguments: {} 
      },
      {
        onSuccess: handleInitSuccess,
        onError: handleError
      }
    )
  }
})

</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger asChild>
      <Button
        variant="outline"
        class="bg-[#29A679] flex items-center gap-1 border-none text-white rounded-lg h-9 hover:bg-primary hover:text-white hover:opacity-85 transition-all"
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
        {{ t('send-notification') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[500px] p-0 overflow-hidden flex flex-col">
       <div class="absolute right-3 top-3 z-10">
        <button
          @click="closeDialog"
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
      <DialogHeader class="bg-gray-50 p-5 border-b border-border shrink-0 flex flex-row items-center gap-2">
        <DialogTitle>{{ t('send-notification') }}</DialogTitle>
      </DialogHeader>

      <div class="px-5 pb-5">
         <form @submit="onSubmit" class="space-y-4">
            <FormField v-slot="{ componentField }" name="templateId">
            <FormItem>
                <FormLabel>{{ t('template') }}</FormLabel>
                <Select v-bind="componentField">
                <FormControl>
                    <SelectTrigger>
                    <SelectValue :placeholder="t('select-template')" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem 
                        v-for="template in templates" 
                        :key="template.id" 
                        :value="String(template.id)"
                    >
                    {{
                        template.locales?.find((l: any) => l.localeKey === locale)?.title ||
                        template.locales?.[0]?.title ||
                        t(template.type)
                    }}
                    </SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            </FormField>

            <FormField v-if="!props.userIds?.length" v-slot="{ componentField }" name="departmentId">
            <FormItem>
                <FormLabel>{{ t('department') }}</FormLabel>
                <Select v-bind="componentField">
                <FormControl>
                    <SelectTrigger>
                    <SelectValue :placeholder="t('select-department')" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="all">{{ t('all-employees') }}</SelectItem>
                    <SelectItem 
                        v-for="dept in departments" 
                        :key="dept.id" 
                        :value="dept.id"
                    >
                    {{ dept.name }}
                    </SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            </FormField>

            <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{{ t('select-push-type') }}</label>
                <Select v-model="pushType">
                    <SelectTrigger>
                         <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="firebase">Firebase (Push)</SelectItem>
                        <SelectItem v-if="canSendSms" value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DialogFooter>
            <Button type="submit" :loading="isSubmitting">
                {{ t('send') }}
            </Button>
            </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
