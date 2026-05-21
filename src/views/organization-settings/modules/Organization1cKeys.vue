<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import { toast } from 'vue-sonner'
import { Trash2Icon } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'

import { useGetIntegratorApiKeys } from '../query/useGetIntegratorApiKeys'
import { useCreateIntegratorApiKey } from '../query/useCreateIntegratorApiKey'
import { useDeleteIntegratorApiKey } from '../query/useDeleteIntegratorApiKey'
import { useActivateIntegratorApiKey } from '../query/useActivateIntegratorApiKey'

const { data, isLoading, refetch } = useGetIntegratorApiKeys()
const { mutateAsync: createApiKey, isPending: creating } = useCreateIntegratorApiKey()
const { mutateAsync: deleteApiKey } = useDeleteIntegratorApiKey()
const { mutateAsync: toggleApiKey } = useActivateIntegratorApiKey()

const apiKeysList = computed(() => data.value?.data || [])

const showCreate = ref(false)
const name = ref('')
const nameError = ref('')

watch(showCreate, (val) => {
  if (val) {
    name.value = ''
    nameError.value = ''
  }
})

const deletingId = ref<string | null>(null)
const togglingId = ref<string | null>(null)
const createdKey = ref<string | null>(null)
const showCreatedDialog = ref(false)
const { t } = useI18n()

const validate = () => {
  if (!name.value.trim()) {
    nameError.value = t('validation.required-field')
    return false
  }
  nameError.value = ''
  return true
}

const handleCreate = async () => {
  if (!validate() || creating.value) return

  try {
    const res = await createApiKey({
      name: name.value.trim(),
      isActive: true
    })

    // @ts-ignore
    const key = res?.data?.data?.apiKey
    if (!key) throw new Error()

    createdKey.value = key
    showCreatedDialog.value = true

    toast.success(t('success.created'))

    name.value = ''
    showCreate.value = false

    await refetch()
  } catch (err: any) {
    toast.error(t('error-occurred'))
    console.error(err)
  }
}

const handleDelete = async (id: string) => {
  if (deletingId.value) return

  deletingId.value = id
  try {
    await deleteApiKey(id)
    toast.success(t('success.deleted'))
    await refetch()
  } catch (err) {
    toast.error(t('error-occurred'))
    console.error(err)
  } finally {
    deletingId.value = null
  }
}

const toggleActive = async (id: string, current: boolean) => {
  if (togglingId.value) return

  togglingId.value = id
  try {
    await toggleApiKey({ id, isActive: !current })
    toast.success(t('success.updated'))
    await refetch()
  } catch (err) {
    toast.error(t('error-occurred'))
    console.error(err)
  } finally {
    togglingId.value = null
  }
}

const copyToClipboard = async () => {
  if (!createdKey.value) return

  try {
    await navigator.clipboard.writeText(createdKey.value)
    toast.success(t('copied'))
  } catch {
    toast.error(t('error-occurred'))
  }
}
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b py-5 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <CardTitle class="text-lg font-semibold text-[#1D1F2C]">{{ t('1C keys') }}</CardTitle>
        <p class="text-sm text-muted-foreground">{{ t('1C keys_description') }}</p>
      </div>
      <Button
        @click="showCreate = !showCreate"
        class="w-full sm:w-auto shadow-none border-none inline-flex items-center justify-center text-sm gap-2 px-4 py-2.5 bg-[#29A679] text-white rounded-lg hover:bg-[#12B76A]/90 hover:text-white transition-colors"
      >
        + {{ t('Add Key') }}
      </Button>
    </CardHeader>
    <CardContent>
      <div class="mx-auto py-3">
        <div v-if="isLoading" class="text-center py-6">
          <span>{{ t('loading') }}...</span>
        </div>

        <template v-else>
          <div v-if="!apiKeysList || apiKeysList.length === 0" class="text-gray-500">{{ t('no-data') }}</div>

          <div v-else class="grid gap-4 pt-4">
            <div
              v-for="key in apiKeysList"
              :key="key.id"
              class="bg-white border rounded-2xl p-5 flex flex-wrap gap-3 justify-between items-center"
            >
              <div>
                <h3 class="text-lg font-semibold">{{ key.name }}</h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ t('Created') }}: {{ formatDateTime(key.createdAt) }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <Button
                  @click="toggleActive(key.id, key.isActive)"
                  :disabled="togglingId === key.id"
                  :loading="togglingId === key.id"
                  :class="[
                    'text-white h-8 rounded-md shadow-none px-3 text-sm min-w-[100px]',
                    key.isActive
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  ]"
                >
                  {{ key.isActive ? t('deactivate') : t('activate') }}
                </Button>

                <DeleteConfirmationDialog :id="key.id" :onConfirm="handleDelete">
                  <template #trigger>
                    <Button
                      :disabled="deletingId === key.id"
                      :loading="deletingId === key.id"
                      class="bg-red-600 text-white h-8 rounded-md px-3 text-sm min-w-[80px]"
                    >
                      <Trash2Icon class="w-4 h-4 mr-2" />
                      {{ t('delete') }}
                    </Button>
                  </template>
                </DeleteConfirmationDialog>
              </div>
            </div>
          </div>
        </template>
      </div>
    </CardContent>
  </Card>

  <!-- 🔐 Created API Key Dialog -->
  <Dialog v-model:open="showCreatedDialog">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="showCreatedDialog = false"
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
        <DialogTitle>{{ t('API Key Created') }}</DialogTitle>
      </DialogHeader>

      <div class="px-5 py-6 pt-2 space-y-4">
        <DialogDescription class="text-red-600 text-sm font-medium">
          {{ t('copy-now-warning') }}
        </DialogDescription>
        <div class="bg-gray-100 p-4 py-2 rounded-md break-all font-mono text-sm relative">
          {{ createdKey }}
        </div>
        <button
          @click="copyToClipboard"
          class="w-full bg-primary inline-flex h-[45px] items-center justify-center rounded-md px-2 py-1 text-base font-medium text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {{ t('copy') }}
        </button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ➕ Add API Key Dialog -->
  <Dialog v-model:open="showCreate">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="showCreate = false"
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
        <DialogTitle>{{ t('Add Key') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('1C keys_description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="px-5 pb-5">
        <div class="grid gap-4 pb-4">
          <div class="space-y-2">
            <label for="apiKeyName" class="text-sm font-medium">{{ t('name') }}</label>
            <input
              id="apiKeyName"
              name="apiKeyName"
              v-model="name"
              type="text"
              :placeholder="t('Enter key')"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none"
              :class="{ 'border-red-500': nameError }"
            />
            <p v-if="nameError" class="text-red-500 text-sm">
              {{ nameError }}
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <Button variant="outline" @click="showCreate = false">
            {{ t('cancel') }}
          </Button>
          <Button
            @click="handleCreate"
            :loading="creating"
            :disabled="creating"
            class="bg-[#29A679] hover:bg-[#12B76A]/90"
          >
            {{ t('save') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
