<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { ref, computed, h, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useGetCameras } from '../query/useCamera'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  FormField
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'vue-sonner'
import { createCamera, updateCamera, deleteCamera, syncCameraEvents, syncCameraEmployees, syncCameraEmployeesOrganization, downloadCameraEmployeesFaces, downloadCameraEmployeesFacesOrganization } from '../api'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import DataTable from './DataTable.vue'
import { CalendarDaysIcon, PencilLineIcon, Trash2Icon, EyeIcon, EyeOffIcon, RefreshCwIcon, DownloadCloudIcon, MoreHorizontalIcon } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import { DatePicker } from '@/views/attendances/list/modules'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetAccountOrgs } from '@/views/account/detail/queries/useGetAccountOrgs'
import type { DateValue } from '@internationalized/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dayjs from 'dayjs'

const { t } = useI18n()
const params = ref<{ page: number; size: number }>({ page: 1, size: 20 })
const { data, isLoading, refetch } = useGetCameras(params.value)
const { data: orgsData } = useGetAccountOrgs()

const currentOrg = computed(() => {
  if (!orgsData.value) return null
  const selectedOrgId = localStorage.getItem('organizationId')
  return (
    orgsData.value.find((org: any) => org.organization?.id?.toString() === selectedOrgId)
      ?.organization || orgsData.value[0]?.organization
  )
})

const isDialogOpen = ref(false)
const isLoading2 = ref(false)
const showPassword = ref(false)
const editingCamera = ref<any>(null)
const isSyncDialogOpen = ref(false)
const syncLoading = ref(false)
const formatDate = (date: Date) => date.toISOString().slice(0, 10)
const syncFromDate = ref(formatDate(new Date()))
const syncToDate = ref(formatDate(new Date()))

const isOrgModalOpen = ref(false)
const selectedAction = ref<'sync' | 'download'>('sync')
const selectedCameraId = ref<number | null>(null)
const selectedOrgId = ref('all')
const isActionLoading = ref(false)

const openOrgModal = (cameraId: number, action: 'sync' | 'download') => {
  selectedCameraId.value = cameraId
  selectedAction.value = action
  selectedOrgId.value = 'all'
  isOrgModalOpen.value = true
}

const handleOrgAction = async () => {
  if (selectedCameraId.value === null) return
  isActionLoading.value = true
  try {
    if (selectedAction.value === 'sync') {
      if (selectedOrgId.value === 'all') {
        await syncCameraEmployees(selectedCameraId.value, [])
      } else {
        await syncCameraEmployeesOrganization(selectedCameraId.value)
      }
      toast.success(t('employees-synced-successfully'))
    } else {
      if (selectedOrgId.value === 'all') {
        await downloadCameraEmployeesFaces(selectedCameraId.value, [])
      } else {
        await downloadCameraEmployeesFacesOrganization(selectedCameraId.value)
      }
      toast.success(t('faces-downloaded-successfully'))
    }
    isOrgModalOpen.value = false
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), { description: errorMessage })
  } finally {
    isActionLoading.value = false
  }
}

const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      name: z.string().min(1, t('validation.required-field')),
      url: z.string().min(1, t('validation.required-field')),
      username: z.string().min(1, t('validation.required-field')),
      password: editingCamera.value
        ? z.string().optional()
        : z.string().min(1, t('validation.required-field')),
      shortSerialNumber: z.string().min(1, t('validation.required-field')),
      isActive: z.boolean().default(true)
    })
  )
)

const form = useForm({
  validationSchema: formSchema,
  validateOnMount: false,
  initialValues: {
    name: '',
    url: '',
    username: '',
    password: '',
    shortSerialNumber: '',
    isActive: true
  }
})

const resetForm = () => {
  form.resetForm({
    values: {
      name: '',
      url: '',
      username: '',
      password: '',
      shortSerialNumber: '',
      isActive: true
    },
    touched: {},
    errors: {}
  })
  editingCamera.value = null
  isDialogOpen.value = false
}

const openSyncDialog = () => {
  syncFromDate.value = formatDate(new Date())
  syncToDate.value = formatDate(new Date())
  isSyncDialogOpen.value = true
}

watch(isSyncDialogOpen, (val) => {
  if (!val) {
    syncFromDate.value = formatDate(new Date())
    syncToDate.value = formatDate(new Date())
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  if (isLoading2.value) return

  try {
    isLoading2.value = true
    if (editingCamera.value) {
      await updateCamera(editingCamera.value.id, {
        name: values.name,
        shortSerialNumber: values.shortSerialNumber,
        username: values.username,
        url: values.url,
        password: values.password || undefined,
        isActive: values.isActive,
        direction: 'both'
      })
      toast.success(t('camera-updated-successfully'))
    } else {
      await createCamera({
        name: values.name,
        shortSerialNumber: values.shortSerialNumber,
        url: values.url,
        username: values.username,
        password: values.password!, // Required in create mode per schema
        isActive: values.isActive,
        direction: 'both'
      })
      toast.success(t('camera-created-successfully'))
    }
    resetForm()
    await refetch()
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), {
      description: errorMessage
    })
  } finally {
    isLoading2.value = false
  }
})

const handleEdit = async (camera: any) => {
  editingCamera.value = {
    name: camera.name || form.values.name,
    url: camera.url ?? form.values.url,
    username: camera.username ?? form.values.username,
    password: camera.password ?? form.values.password,
    shortSerialNumber: camera.shortSerialNumber ?? form.values.shortSerialNumber,
    isActive: camera.isActive ?? form.values.isActive,
    id: camera.id
  }
  form.resetForm({
    values: {
      name: camera.name || form.values.name,
      url: camera.url ?? form.values.url,
      username: camera.username ?? form.values.username,
      password: camera.password ?? form.values.password,
      shortSerialNumber: camera.shortSerialNumber ?? form.values.shortSerialNumber,
      isActive: camera.isActive ?? form.values.isActive
    },
    errors: {},
    touched: {}
  })
  await nextTick()
  isDialogOpen.value = true
}

const handleCreate = () => {
  editingCamera.value = null
  form.resetForm({
    values: {
      name: '',
      url: '',
      username: '',
      password: '',
      shortSerialNumber: '',
      isActive: true
    },
    touched: {},
    errors: {}
  })
  isDialogOpen.value = true
}

const deletingId = ref<string | null>(null)
const handleDelete = async (id: string) => {
  if (deletingId.value) return

  deletingId.value = id
  try {
    await deleteCamera(id)
    toast.success(t('success.deleted'))
    await refetch()
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), {
      description: errorMessage
    })
  } finally {
    deletingId.value = null
  }
}

const handleSync = async () => {
  if (syncLoading.value) return

  if (!syncFromDate.value) {
    toast.error(t('from-date-required'))
    return
  }

  try {
    syncLoading.value = true
    await syncCameraEvents({
      fromDate: syncFromDate.value,
      toDate: syncToDate.value
    })
    toast.success(t('camera-sync-started'))
    isSyncDialogOpen.value = false
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), {
      description: errorMessage
    })
  } finally {
    syncLoading.value = false
  }
}

const handleSyncFromDateChange = (value: DateValue | undefined) => {
  if (!value) return
  syncFromDate.value = dayjs(value.toString()).format('YYYY-MM-DD')
}

const handleSyncToDateChange = (value: DateValue | undefined) => {
  if (!value) return
  syncToDate.value = dayjs(value.toString()).format('YYYY-MM-DD')
}

const columns: ComputedRef<any[]> = computed(() => [
  {
    id: 'name',
    header: t('name'),
    cell: ({ row }: any) =>
      h('span', { class: 'text-sm font-semibold text-[#1D1F2C] truncate block max-w-[200px]' }, row.original.name)
  },
  {
    id: 'url',
    header: t('url'),
    cell: ({ row }: any) =>
      h(
        'a',
        {
          href: row.original.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-sm font-medium underline-offset-4 hover:underline truncate block max-w-[300px]'
        },
        row.original.url
      )
  },
  {
    id: 'shortSerialNumber',
    header: t('short-serial-number'),
    cell: ({ row }: any) =>
      h('span', { class: 'text-sm font-semibold text-[#1D1F2C] truncate block max-w-[150px]' }, row.original.shortSerialNumber)
  },
  {
    id: 'status',
    header: t('status'),
    cell: ({ row }: any) =>
      h(
        'span',
        {
          class: `inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold ${
            row.original.isActive ? 'bg-[#E6F6EF] text-[#15803D]' : 'bg-[#FDEAEA] text-[#B42318]'
          }`
        },
        row.original.isActive ? t('active') : t('inactive')
      )
  },
  {
    id: 'actions',
    header: t('actions'),
    cell: ({ row }: any) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(
          'button',
          {
            type: 'button',
            onClick: () => {
              handleEdit(row.original)
            },
            class:
              'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F9F2] text-[#15803D] transition-colors duration-200 hover:bg-[#D7F3E6] focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:ring-offset-2',
            title: t('edit'),
            'aria-label': t('edit')
          },
          [h(PencilLineIcon, { class: 'h-4 w-4' })]
        ),
        h(DeleteConfirmationDialog, {
          id: row.original.id,
          onConfirm: handleDelete,
          description: t('confirm-delete-camera')
        }, {
          trigger: () => h(
            Button,
            {
              type: 'button',
              disabled: deletingId.value === row.original.id,
              loading: deletingId.value === row.original.id,
              class: 'h-8 w-8 p-0 flex items-center justify-center rounded-lg bg-[#FEF3F2] text-[#DC2626] transition-colors duration-200 hover:bg-[#FBE1DE] focus:outline-none focus:ring-2 focus:ring-[#FECACA] focus:ring-offset-2 shadow-none',
              title: t('delete'),
              'aria-label': t('delete')
            },
            { default: () => h(Trash2Icon, { class: 'h-4 w-4' }) }
          )
        }),
        h(DropdownMenu, {}, {
          default: () => [
            h(DropdownMenuTrigger, { asChild: true }, {
              default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0 rounded-lg hover:bg-gray-100', title: t('more-options') }, {
                default: () => h(MoreHorizontalIcon, { class: 'h-4 w-4 text-gray-500' })
              })
            }),
            h(DropdownMenuContent, { align: 'end' }, {
              default: () => [
                h(DropdownMenuItem, { onClick: () => openOrgModal(row.original.id, 'sync') }, {
                  default: () => [h(RefreshCwIcon, { class: 'mr-2 h-4 w-4 text-blue-500' }), h('span', t('sync-employees'))]
                }),
                h(DropdownMenuItem, { onClick: () => openOrgModal(row.original.id, 'download') }, {
                  default: () => [h(DownloadCloudIcon, { class: 'mr-2 h-4 w-4 text-purple-500' }), h('span', t('download-faces'))]
                }),
              ]
            })
          ]
        })
      ])
  }
])
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b py-5 bg-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div class="space-y-1">
        <CardTitle class="text-lg font-semibold text-[#1D1F2C]">{{ t('Camera settings') }}</CardTitle>
        <p class="text-sm text-muted-foreground">{{ t('camera-settings-description') }}</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full lg:w-auto">
        <Button
          variant="outline"
          @click="openSyncDialog"
          class="flex-1 sm:flex-none shadow-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#344054] hover:bg-[#F2F4F7] transition-colors"
        >
          <CalendarDaysIcon class="h-4 w-4" />
          {{ t('sync-camera-events') }}
        </Button>
        <Button
          @click="handleCreate"
          class="flex-1 sm:flex-none shadow-none border-none inline-flex items-center justify-center text-sm gap-2 px-4 py-2.5 bg-[#29A679] text-white rounded-lg hover:bg-[#12B76A]/90 hover:text-white transition-colors"
        >
          {{ t('add-camera') }}
        </Button>
      </div>
    </CardHeader>
    <CardContent class="p-0">
      <div class="w-full overflow-x-auto scrollbar-hide">
          <DataTable :columns="columns" :data="data?.data?.data" :loading="isLoading" />
        </div>
    </CardContent>
  </Card>

  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="isDialogOpen = !isDialogOpen"
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
        <DialogTitle>{{ editingCamera ? t('edit') : t('add-camera') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('camera-settings-description') }}
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit" class="px-5 py-4 pt-0">
        <div class="grid gap-4 mb-6">
          <!-- Name -->
          <FormField name="name" v-slot="{ componentField, errors }">
            <div class="space-y-2">
              <Label for="camera-name">{{ t('name') }}</Label>
              <Input
                id="camera-name"
                v-bind="componentField"
                :placeholder="t('name')"
              />
              <p v-if="errors[0]" class="text-[0.8rem] font-medium text-destructive">
                {{ errors[0] }}
              </p>
            </div>
          </FormField>

          <!-- URL -->
          <FormField name="url" v-slot="{ componentField, errors }">
            <div class="space-y-2">
              <Label for="camera-url">{{ t('url') }}</Label>
              <Input id="camera-url" v-bind="componentField" :placeholder="t('url')" />
              <p v-if="errors[0]" class="text-[0.8rem] font-medium text-destructive">
                {{ errors[0] }}
              </p>
            </div>
          </FormField>

          <!-- Username -->
          <FormField name="username" v-slot="{ componentField, errors }">
            <div class="space-y-2">
              <Label for="camera-username">{{ t('username') }}</Label>
              <Input
                id="camera-username"
                v-bind="componentField"
                :placeholder="t('username')"
              />
              <p v-if="errors[0]" class="text-[0.8rem] font-medium text-destructive">
                {{ errors[0] }}
              </p>
            </div>
          </FormField>

          <!-- Password -->
          <FormField name="password" v-slot="{ componentField, errors }">
            <div class="space-y-2">
              <Label for="camera-password">{{ t('password') }}</Label>
              <div class="relative">
                <Input
                  id="camera-password"
                  v-bind="componentField"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('password')"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" class="h-4 w-4 text-muted-foreground" />
                  <EyeOffIcon v-else class="h-4 w-4 text-muted-foreground" />
                  <span class="sr-only">
                    {{ showPassword ? t('password') : t('showing') }}
                  </span>
                </Button>
              </div>
              <p v-if="errors[0]" class="text-[0.8rem] font-medium text-destructive">
                {{ errors[0] }}
              </p>
            </div>
          </FormField>

          <!-- Short Serial Number -->
          <FormField name="shortSerialNumber" v-slot="{ componentField, errors }">
            <div class="space-y-2">
              <Label for="camera-sn">{{ t('short-serial-number') }}</Label>
              <Input
                id="camera-sn"
                v-bind="componentField"
                :placeholder="t('short-serial-number')"
              />
              <p v-if="errors[0]" class="text-[0.8rem] font-medium text-destructive">
                {{ errors[0] }}
              </p>
            </div>
          </FormField>

          <!-- isActive -->
          <FormField name="isActive" v-slot="{ componentField }">
            <div
              class="flex flex-row items-center justify-between rounded-lg border p-4 py-2 mb-3 mt-2"
            >
              <div class="space-y-0.5">
                <Label for="camera-active" class="text-sm font-medium">{{ t('active') }}</Label>
              </div>
              <Switch
                id="camera-active"
                :checked="componentField.modelValue"
                @update:checked="componentField.onChange"
              />
            </div>
          </FormField>
        </div>
        <DialogFooter class="grid grid-cols-2 gap-2 -mt-3">
          <Button type="button" variant="outline" @click="resetForm" :disabled="isLoading2">
            {{ t('cancel') }}
          </Button>
          <Button type="submit" :loading="isLoading2" :disabled="isLoading2">
            {{ editingCamera ? t('save') : t('save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isSyncDialogOpen">
    <DialogContent class="px-0 py-0 overflow-hidden">
      <button
        @click="isSyncDialogOpen = false"
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
        <DialogTitle class="pb-1">{{ t('sync-camera-events') }}</DialogTitle>
        <DialogDescription class="sr-only">
          Choose date range to sync camera events.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 px-5">
        <div class="flex items-center justify-between gap-4">
          <Label for="syncFromDate" class="text-base font-medium text-[#1D1F2C]">{{ t('from-date') }}</Label>
          <DatePicker
            id="syncFromDate"
            :initial="syncFromDate"
            @confirm:date="handleSyncFromDateChange"
            class="w-[180px]"
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Label for="syncToDate" class="text-base font-medium text-[#1D1F2C]">{{ t('end-date') }}</Label>
          <DatePicker
            id="syncToDate"
            :initial="syncToDate"
            @confirm:date="handleSyncToDateChange"
            class="w-[180px]"
          />
        </div>
      </div>

      <DialogFooter class="grid grid-cols-2 gap-2 p-5 pt-2">
        <Button type="button" variant="outline" @click="isSyncDialogOpen = false" :disabled="syncLoading">
          {{ t('cancel') }}
        </Button>
        <Button type="button" :loading="syncLoading" :disabled="syncLoading" @click="handleSync">
          {{ t('start-sync') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isOrgModalOpen">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="isOrgModalOpen = false"
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
        <DialogTitle class="pb-1">{{ selectedAction === 'sync' ? t('sync-employees', 'Sync Employees') : t('download-faces', 'Download Faces') }}</DialogTitle>
        <DialogDescription class="sr-only">
          Choose an organization.
        </DialogDescription>
      </DialogHeader>

      <div class="px-5">
        <div class="space-y-2">
          <Label for="org-select">{{ t('organization', 'Tashkilot') }}</Label>
          <Select v-model="selectedOrgId">
            <SelectTrigger id="org-select">
              <SelectValue :placeholder="t('select-organization', 'Tashkilotni tanlang')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {{ t('all') }}
                </SelectItem>
                <SelectItem v-if="currentOrg" :value="currentOrg.id.toString()">
                  {{ currentOrg.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter class="grid grid-cols-2 p-5 pt-2.5">
        <Button type="button" variant="outline" @click="isOrgModalOpen = false" :disabled="isActionLoading">
          {{ t('cancel') }}
        </Button>
        <Button type="button" :loading="isActionLoading" :disabled="isActionLoading" @click="handleOrgAction">
          {{ t('confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
