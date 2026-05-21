<script setup lang="ts">
import { ref, computed, h, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toFormValidator } from '@vee-validate/zod'
import DataTable from './DataTable.vue'
import { PencilLineIcon, CalendarPlusIcon, Trash2Icon } from 'lucide-vue-next'
import { DatePicker } from '@/views/attendances/list/modules'
import type { DateValue } from '@internationalized/date'
import { useGetDaysOff } from '../query/useGetDaysOff'
import { useCreateDayOff } from '../query/useCreateDayOff'
import { useUpdateDayOff } from '../query/useUpdateDayOff'
import { useDeleteDayOff } from '../query/useDeleteDayOff'
import { useSeedDaysOffFromGoogleCalendar } from '../query/useSeedDaysOffFromGoogleCalendar'
import dayjs from 'dayjs'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'

interface DayOff {
  id: number
  date: string
  description?: string
}

const { t } = useI18n()

function getErrorMessage(error: any): string {
  return error?.response?.data?.error?.message || error?.message || t('error.unknown')
}

const params = ref<{ page: number; size: number; order?: string }>({
  page: 1,
  size: 10,
  order: 'desc'
})
const { data, isLoading, refetch } = useGetDaysOff(params)

const pagination = computed(() => {
  if (!data.value?.headers['x-pagination']) return undefined
  try {
    return JSON.parse(data.value.headers['x-pagination'])
  } catch {
    return undefined
  }
})

const handlePaginationUpdate = (newParams: { page: number; size: number }) => {
  params.value = { ...params.value, ...newParams }
}

const { mutateAsync: createDayOff } = useCreateDayOff()
const { mutateAsync: updateDayOff } = useUpdateDayOff()
const { mutateAsync: deleteDayOff } = useDeleteDayOff()
const { mutateAsync: seedGoogleCalendar, isPending: isSeeding } = useSeedDaysOffFromGoogleCalendar()

const isDialogOpen = ref(false)
const isGoogleDialogOpen = ref(false)
const calendarId = ref('')
const isSubmitting = ref(false)
const editingItem = ref<DayOff | null>(null)

const handleOpenGoogleDialog = () => {
  calendarId.value = ''
  isGoogleDialogOpen.value = true
}

const formSchema = z.object({
  date: z.string({ required_error: 'validation.required-field' }).min(1, 'validation.required-field'),
  description: z.string({ required_error: 'validation.required-field' }).min(1, 'validation.required-field')
})

const form = useForm({
  validationSchema: toFormValidator(formSchema),
  initialValues: {
    date: '',
    description: ''
  }
})

const resetForm = () => {
  form.resetForm()
  editingItem.value = null
  isDialogOpen.value = false
}

const onSubmit = form.handleSubmit(async (values) => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    const dateStr = values.date
      ? `${dayjs(values.date).format('YYYY-MM-DD')}T00:00:00.000Z`
      : new Date().toISOString()

    if (editingItem.value) {
      if (!form.meta.value.dirty) {
        toast.info(t('no-changes'))
        resetForm()
        return
      }

      await updateDayOff({
        id: editingItem.value.id,
        data: {
          date: dateStr,
          description: values.description || ''
        }
      })
      toast.success(t('success.updated'))
    } else {
      await createDayOff({
        date: dateStr,
        description: values.description || ''
      })
      toast.success(t('success.created'))
    }
    resetForm()
    await refetch()
  } catch (error: any) {
    toast.error(t('error-occurred'), {
      description: getErrorMessage(error)
    })
  } finally {
    isSubmitting.value = false
  }
})

const handleEdit = async (item: DayOff) => {
  editingItem.value = item
  isDialogOpen.value = true
  await nextTick()

  form.resetForm({
    values: {
      date: item.date.slice(0, 10),
      description: item.description || ''
    }
  })
}

const handleCreate = () => {
  editingItem.value = null
  form.resetForm({
    values: {
      date: '',
      description: ''
    }
  })
  isDialogOpen.value = true
}

const handleDelete = async (id: number) => {
  await deleteDayOff(id)
  await refetch()
}

const handleDateChange = (value: DateValue | undefined) => {
  if (!value) return form.setFieldValue('date', '')
  form.setFieldValue('date', dayjs(value.toString()).format('YYYY-MM-DD'))
}

const handleSeedGoogleCalendar = async () => {
  if (isSeeding.value || !calendarId.value.trim()) {
    toast.error(t('validation.required-field'))
    return
  }

  try {
    await seedGoogleCalendar({ calendarId: calendarId.value.trim() })
    toast.success(t('success.created'))
    isGoogleDialogOpen.value = false
    calendarId.value = ''
    await refetch()
  } catch (error: any) {
    toast.error(t('error-occurred'), {
      description: getErrorMessage(error)
    })
  }
}

const columns = computed(() => [
  {
    id: 'date',
    header: t('date'),
    cell: ({ row }: { row: { original: DayOff } }) =>
      h('span', { class: 'text-sm font-medium' }, dayjs(row.original.date).format('DD.MM.YYYY'))
  },
  {
    id: 'description',
    header: t('description'),
    cell: ({ row }: { row: { original: DayOff } }) =>
      h('span', { class: 'text-sm' }, row.original.description)
  },
  {
    id: 'actions',
    header: t('actions'),
    cell: ({ row }: { row: { original: DayOff } }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          'button',
          {
            onClick: () => handleEdit(row.original),
            class:
              'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F9F2] text-[#15803D] transition-colors duration-200 hover:bg-[#D7F3E6] focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:ring-offset-2',
            title: t('edit')
          },
          [h(PencilLineIcon, { class: 'h-4 w-4' })]
        ),
        h(DeleteConfirmationDialog, {
          id: row.original.id,
          onConfirm: handleDelete,
        }, {
          trigger: () => h(
            'button',
            {
              type: 'button',
              class: 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF3F2] text-[#DC2626] transition-colors duration-200 hover:bg-[#FBE1DE] focus:outline-none focus:ring-2 focus:ring-[#FECACA] focus:ring-offset-2',
              title: t('delete')
            },
            [h(Trash2Icon, { class: 'h-4 w-4' })]
          )
        })
      ])
  }
])
</script>

<template>
  <div class="w-full space-y-4">
    <Card
      class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden h-fit"
    >
      <CardHeader class="border-b py-4 bg-gray-50 flex flex-row items-center justify-between">
        <div class="space-y-1">
          <CardTitle class="text-lg">{{ t('days-off') }}</CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ t('settings-days-off-desc') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            @click.stop="handleOpenGoogleDialog"
            class="h-8 shadow-sm"
          >
            <CalendarPlusIcon class="w-4 h-4 mr-2" />
            Google Calendar
          </Button>
          <Button size="sm" @click="handleCreate" class="h-8 shadow-sm">{{ t('add') }}</Button>
        </div>
      </CardHeader>

      <div class="p-0">
        <DataTable
          :columns="columns"
          :data="data?.data?.data || []"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="handlePaginationUpdate"
          class="border-0 shadow-none"
        />
      </div>
    </Card>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
        <button
          @click="isDialogOpen = false"
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
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white"></rect>
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0"></rect>
            <path
              d="M20 12L12 20M12 12L20 20"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
        <DialogHeader class="bg-gray-50 p-5 border-b border-border">
          <DialogTitle>{{ editingItem ? t('edit') : t('add') }}</DialogTitle>
          <DialogDescription class="sr-only">
            Add or edit day off details.
          </DialogDescription>
        </DialogHeader>
        <form @submit="onSubmit" class="space-y-4 px-5 pb-6">
          <FormField name="date" v-slot="{ componentField, errors }">
            <FormItem class="flex flex-col">
              <FormLabel>{{ t('date') }}</FormLabel>
              <FormControl>
                <DatePicker
                  :initial="componentField.modelValue"
                  @confirm:date="handleDateChange"
                  class="w-full"
                />

              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormItem>

          </FormField>

          <FormField name="description" v-slot="{ componentField, errors }">
            <FormItem>
              <FormLabel>{{ t('description') }}</FormLabel>
              <FormControl>
                <Input v-bind="componentField" :placeholder="t('description')" />
              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormItem>
          </FormField>

          <DialogFooter class="pt-2 flex">
            <Button type="button" variant="outline" @click="resetForm" :disabled="isSubmitting">
              {{ t('cancel') }}
            </Button>
            <Button
              type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              class="ml-1"
            >
              {{ t('save') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isGoogleDialogOpen">
      <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
        <button
          @click="isGoogleDialogOpen = false"
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
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white"></rect>
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0"></rect>
            <path
              d="M20 12L12 20M12 12L20 20"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
        <DialogHeader class="bg-gray-50 p-5 border-b border-border">
          <DialogTitle>{{ t('seed-from-google-calendar') }}</DialogTitle>
          <DialogDescription class="sr-only">
            Import days off from your Google Calendar.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSeedGoogleCalendar" class="space-y-4 px-5 pb-6">
          <div class="space-y-2">
            <Label for="calendar-id">{{ t('calendar-id') }}</Label>
            <Input id="calendar-id" name="calendar-id" v-model="calendarId" />
          </div>


          <DialogFooter class="pt-4 flex gap-4">
            <Button
              type="button"
              variant="outline"
              @click="isGoogleDialogOpen = false"
              :disabled="isSeeding"
            >
              {{ t('cancel') }}
            </Button>
            <Button
              type="submit"
              :loading="isSeeding"
              :disabled="isSeeding"
              :aria-busy="isSeeding"
              class="bg-blue-600 hover:bg-blue-700"
            >
              {{ t('seed-calendar') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
