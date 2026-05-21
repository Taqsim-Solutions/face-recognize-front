<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGetPendingChanges } from '../query/useGetPendingChanges'
import { useApprovePendingChange } from '../query/useApprovePendingChange'
import { useRejectPendingChange } from '../query/useRejectPendingChange'
import type { PendingChange } from '../types'
import { formatDateTime } from '@/lib/utils'
import api from '@/api'

const { t } = useI18n()

const params = ref({
  status: 'pending',
  page: 1,
  size: 10
})

const { data, isLoading, refetch } = useGetPendingChanges(params)
const { mutateAsync: approveChange, isPending: approving } = useApprovePendingChange()
const { mutateAsync: rejectChange, isPending: rejecting } = useRejectPendingChange()

const pendingChanges = computed(() => data.value?.data || [])

const selectedChange = ref<PendingChange | null>(null)
const showDetails = ref(false)
const showRejectDialog = ref(false)
const rejectReason = ref('')
const originalData = ref<any>(null)
const employeeImage = ref<string | null>(null)
const isFetchingOriginal = ref(false)

const fetchEmployeeImage = async (employeeId: string) => {
  try {
    const res = await api.get(`/api/employee-files?employeeId=${employeeId}&type=faceImage&isAll=true`)
    const files = res.data?.data || []
    if (files.length > 0) {
      const file = files[0]
      return `/api/employee-files/${file.id}/download`
    }
    return null
  } catch (err) {
    console.error('Failed to fetch employee image', err)
    return null
  }
}

const fetchOriginalEntity = async (type: string, id: string) => {
  const urlMap: Record<string, string> = {
    employee: `/api/employees/${id}`,
    employeeLeave: `/api/employee-leaves/${id}`
  }
  const url = urlMap[type]
  if (!url) return null
  try {
    const res = await api.get(url)
    return res.data?.data
  } catch (err) {
    console.error('Failed to fetch original entity', err)
    return null
  }
}

const openDetails = async (change: PendingChange) => {
  selectedChange.value = change
  showDetails.value = true
  originalData.value = null
  employeeImage.value = null
  
  let targetEmployeeId = change.entityId
  
  // For bonus and leave, the ID might be in the payload
  if (!targetEmployeeId && change.payload) {
    try {
      const payload = JSON.parse(change.payload)
      targetEmployeeId = payload.EmployeeId || payload.Model?.EmployeeId || payload.employeeId
    } catch (err) {
      console.error('Failed to parse payload for employee ID', err)
    }
  }

  if (targetEmployeeId && (change.entityType === 'employee' || change.entityType === 'employeeBonus' || change.entityType === 'employeeLeave')) {
    isFetchingOriginal.value = true
    const [data, img] = await Promise.all([
      fetchOriginalEntity('employee', targetEmployeeId),
      fetchEmployeeImage(targetEmployeeId)
    ])
    originalData.value = data
    employeeImage.value = img
    isFetchingOriginal.value = false
  } else if (change.entityId && change.actionType === 'update') {
    isFetchingOriginal.value = true
    originalData.value = await fetchOriginalEntity(change.entityType, change.entityId)
    isFetchingOriginal.value = false
  }
}

const parsedPayload = computed(() => {
  if (!selectedChange.value?.payload) return {}
  try {
    return JSON.parse(selectedChange.value.payload)
  } catch {
    return {}
  }
})

const diffData = computed(() => {
  if (!selectedChange.value) {
    return []
  }

  const diffs: any[] = []
  const payload = parsedPayload.value
  
  const typeMap: Record<string, string> = {
    '1': 'inn',
    '2': 'passportSerialNumber',
    '3': 'pinfl',
    '4': 'phoneNumber',
    '5': 'employeeNo'
  }

  // Map payload fields to API response fields (PascalCase to camelCase or direct)
  const getOriginalValue = (field: string) => {
    if (!originalData.value) return undefined
    if (field in originalData.value) return originalData.value[field]
    
    // Try camelCase
    const camelField = field.charAt(0).toLowerCase() + field.slice(1)
    if (camelField in originalData.value) return originalData.value[camelField]
    
    // Try lowercase
    const lowerField = field.toLowerCase()
    if (lowerField in originalData.value) return originalData.value[lowerField]

    // Check identifiers array for fields like PINFL, INN, etc.
    if (originalData.value.identifiers && Array.isArray(originalData.value.identifiers)) {
      const ident = originalData.value.identifiers.find((i: any) => 
        String(i.type).toLowerCase() === lowerField
      )
      if (ident) return ident.value || ident.Value
    }
    
    return undefined
  }

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '—'
    if (Array.isArray(val)) {
      if (val.length === 0) return '—'
      return val.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle card numbers specifically
          if (item.maskedNumber) return item.maskedNumber
          
          let type = item.type || item.Type
          const value = item.value || item.Value
          if (typeMap[String(type)]) type = typeMap[String(type)]
          if (type && value) return `${t(type)}: ${value}`
          return JSON.stringify(item)
        }
        return String(item)
      }).join('\n')
    }
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  const fieldsToSkip = ['pinfl', 'inn', 'passportserialnumber', 'passport', 'stir']

  Object.keys(payload).forEach(field => {
    // Skip redundant top-level identifiers
    if (fieldsToSkip.includes(field.toLowerCase())) return

    const currentRaw = getOriginalValue(field)
    const proposedRaw = payload[field]

    // Handle Identifiers as separate rows
    if (field.toLowerCase() === 'identifiers' && Array.isArray(proposedRaw)) {
      proposedRaw.forEach(propItem => {
        let propType = propItem.type || propItem.Type
        const propVal = propItem.value || propItem.Value
        if (typeMap[String(propType)]) propType = typeMap[String(propType)]

        const originalIdents = (originalData.value?.identifiers || [])
        const currentIdent = originalIdents.find((c: any) => {
          let cType = c.type || c.Type
          if (typeMap[String(cType)]) cType = typeMap[String(cType)]
          return String(cType).toLowerCase() === String(propType).toLowerCase()
        })

        const currentVal = currentIdent ? (currentIdent.value || currentIdent.Value) : null

        diffs.push({
          field: propType,
          current: currentVal ?? '—',
          proposed: propVal,
          isChanged: String(currentVal) !== String(propVal)
        })
      })
      return
    }

    const current = formatValue(currentRaw)
    const proposed = formatValue(proposedRaw)

    diffs.push({
      field,
      current,
      proposed,
      isChanged: current !== proposed
    })
  })

  return diffs
})

const handleApprove = async (id: string) => {
  try {
    await approveChange(id)
    toast.success(t('success.approved'))
    showDetails.value = false
    await refetch()
  } catch (err) {
    toast.error(t('error-occurred'))
    console.error(err)
  }
}

const handleReject = async () => {
  if (!selectedChange.value || !rejectReason.value.trim()) return

  try {
    await rejectChange({ id: selectedChange.value.id, reason: rejectReason.value })
    toast.success(t('success.rejected'))
    showRejectDialog.value = false
    showDetails.value = false
    rejectReason.value = ''
    await refetch()
  } catch (err) {
    toast.error(t('error-occurred'))
    console.error(err)
  }
}
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'approved':
      return 'bg-[#e6f7e9] text-green-700 border-green-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b py-5 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <CardTitle class="text-lg font-semibold text-[#1D1F2C]">{{ t('Pending Changes') }}</CardTitle>
        <p class="text-sm text-muted-foreground">{{ t('Review and manage changes sent by integrators') }}</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Select v-model="params.status">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue :placeholder="t('Status')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{{ t('pending') }}</SelectItem>
            <SelectItem value="approved">{{ t('approved') }}</SelectItem>
            <SelectItem value="rejected">{{ t('rejected') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <div class="mx-auto py-3 pt-6">
        <div v-if="isLoading" class="text-center py-6">
          <span>{{ t('loading') }}...</span>
        </div>

        <template v-else>
          <div v-if="!pendingChanges || pendingChanges.length === 0" class="text-gray-500 text-center py-10">
            {{ t('no-data') }}
          </div>

          <div v-else class="grid gap-4">
            <div
              v-for="change in pendingChanges"
              :key="change.id"
              class="bg-white border rounded-2xl p-5 flex flex-wrap gap-3 justify-between items-center hover:border-primary/50 transition-colors cursor-pointer"
              @click="openDetails(change)"
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-lg">{{ t(change.entityType) }}</span>
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-medium border', getStatusColor(change.status)]">
                    {{ t(change.status) }}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium text-gray-700">{{ t('Action') }}:</span> {{ t(change.actionType) }}
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium text-gray-700">{{ t('Created') }}:</span> {{ formatDateTime(change.createdAt) }}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click.stop="openDetails(change)">
                  {{ t('view-details') }}
                </Button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </CardContent>
  </Card>

  <!-- Details Dialog -->
  <Dialog v-model:open="showDetails">
    <DialogContent class="sm:max-w-[600px] p-0 overflow-hidden">
      <button
        @click="showDetails = false"
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
        <DialogTitle>{{ t('Change Details') }}</DialogTitle>
      </DialogHeader>

      <div class="px-5 pb-6 pt-2 space-y-5 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-200">
          <div>
            <p class="text-gray-500">{{ t('Entity Type') }}</p>
            <p class="font-medium">{{ t(selectedChange?.entityType || '') }}</p>
          </div>
          <div>
            <p class="text-gray-500">{{ t('Action Type') }}</p>
            <p class="font-medium">{{ t(selectedChange?.actionType || '') }}</p>
          </div>
          <div>
            <p class="text-gray-500">{{ t('Status') }}</p>
            <p :class="['inline-block px-2 mt-0.5 py-0.5 rounded-full text-xs font-medium border', getStatusColor(selectedChange?.status || '')]">
              {{ t(selectedChange?.status || '') }}
            </p>
          </div>
          <div>
            <p class="text-gray-500">{{ t('Created At') }}</p>
            <p class="font-medium">{{ selectedChange ? formatDateTime(selectedChange.createdAt) : '' }}</p>
          </div>
          <div v-if="selectedChange?.reviewedAt">
            <p class="text-gray-500">{{ t('Reviewed At') }}</p>
            <p class="font-medium">{{ formatDateTime(selectedChange.reviewedAt) }}</p>
          </div>
        </div>

        <!-- Employee Context Card Skeleton -->
        <div v-if="isFetchingOriginal" class="bg-gray-50/50 border rounded-xl p-2 px-3 flex items-center gap-3 animate-pulse">
          <div class="w-14 h-14 rounded-full bg-gray-200 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>

        <!-- Employee Context Card -->
        <div 
          v-if="!isFetchingOriginal && (originalData || (selectedChange?.actionType === 'create' && selectedChange?.entityType === 'employee'))" 
          class="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-2 px-3 flex items-center gap-3"
        >
          <!-- Premium Avatar with Ring -->
          <div class="relative shrink-0 flex items-center justify-center p-1 rounded-full border border-gray-100 bg-white shadow-sm">
            <div class="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-slow"></div>
            <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-2 border-white shadow-md shrink-0 overflow-hidden relative z-10">
              <img 
                v-if="employeeImage || originalData?.image || originalData?.imageUrl || originalData?.user?.image" 
                :src="employeeImage || originalData?.image || originalData?.imageUrl || originalData?.user?.image" 
                class="w-full h-full object-cover"
                alt="Employee Avatar"
              />
              <span v-else>
                {{ (originalData?.comment || originalData?.firstName || parsedPayload?.Comment || parsedPayload?.FirstName || '?').charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 truncate text-base leading-tight">
              {{ originalData?.comment || (originalData ? `${originalData.firstName} ${originalData.lastName}` : (parsedPayload?.Comment || `${parsedPayload?.FirstName || ''} ${parsedPayload?.LastName || ''}`)) }}
            </h3>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
              <div v-if="originalData?.department || parsedPayload?.DepartmentName" class="flex items-center gap-1">
                <svg class="mr-0.5 mt-[1.5px]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.91A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.79 1.09L21 9"/></svg>
                {{ originalData?.department?.name || parsedPayload?.DepartmentName }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="isFetchingOriginal" class="py-4 text-center text-sm text-gray-500 animate-pulse">
          {{ t('loading') }}...
        </div>

        <div v-else-if="diffData.length > 0 && selectedChange?.entityType !== 'employeeBonus'" class="space-y-3">
          <p class="text-base font-semibold text-gray-900 mb-4">{{ t('Comparison') }}</p>
          <div class="overflow-hidden border rounded-xl">
            <table class="w-full text-left text-sm border-collapse">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-2.5 font-semibold text-gray-700 border-r">{{ t('Field') }}</th>
                  <th class="px-4 py-2.5 font-semibold text-gray-700 border-r">{{ t('Current Value') }}</th>
                  <th class="px-4 py-2.5 font-semibold text-gray-700">{{ t('Proposed Value') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr 
                  v-for="diff in diffData" 
                  :key="diff.field" 
                  :class="[
                    'transition-colors',
                    diff.isChanged ? 'bg-green-50/80 hover:bg-green-100/80' : 'hover:bg-gray-50/50'
                  ]"
                >
                  <td :class="['px-4 py-2.5 font-medium border-r bg-gray-50/30', diff.isChanged ? 'text-green-900' : 'text-gray-600']">
                    {{ t(diff.field) }}
                  </td>
                  <td class="px-4 py-2.5 text-gray-500 border-r whitespace-pre-line">{{ diff.current ?? '—' }}</td>
                  <td 
                    class="px-4 py-2.5 font-semibold whitespace-pre-line"
                    :class="[!diff.isChanged ? 'text-gray-400' : '']"
                    :style="diff.isChanged ? { color: '#29A679', backgroundColor: '#EBF9F4' } : {}"
                  >
                    {{ diff.proposed }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="selectedChange?.entityType === 'employeeBonus' && parsedPayload" class="space-y-4">
          <p class="text-base font-semibold text-gray-900">{{ t('Bonus Details') }}</p>
          <div class="bg-gray-50 border rounded-xl p-4 grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm uppercase text-gray-500 font-medium -mb-0.5">{{ t('Amount') }}</p>
              <p class="text-xl font-bold text-primary">
                {{ new Intl.NumberFormat('uz-UZ').format(parsedPayload.Amount || parsedPayload.Model?.Amount || 0) }} 
                <span class="text-sm font-medium text-gray-500">UZS</span>
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm uppercase text-gray-500 font-medium -mb-0.5">{{ t('Type') }}</p>
              <p class="text-base font-semibold text-gray-800">
                {{ t('employeeBonus') }}
              </p>
            </div>
            <div v-if="parsedPayload.Comment || parsedPayload.Model?.Comment" class="col-span-2 space-y-1 border-t pt-3">
              <p class="text-sm text-gray-500 font-medium">{{ t('Comment') }}</p>
              <p class="text-sm text-gray-700 italic">
                "{{ parsedPayload.Comment || parsedPayload.Model?.Comment }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Employee Leave Details -->
        <div v-if="selectedChange?.entityType === 'employeeLeave' && parsedPayload" class="space-y-4">
          <p class="text-base font-semibold text-gray-900">{{ t('Leave Details') }}</p>
          <div class="bg-gray-50 border rounded-xl p-4 grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm uppercase text-gray-500 font-medium -mb-0.5">{{ t('Start Date') }}</p>
              <p class="text-base font-bold text-gray-900">
                {{ formatDateTime(parsedPayload.startDate || parsedPayload.StartDate).split(' ')[0] }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm uppercase text-gray-500 font-medium -mb-0.5">{{ t('End Date') }}</p>
              <p class="text-base font-bold text-gray-900">
                {{ formatDateTime(parsedPayload.endDate || parsedPayload.EndDate).split(' ')[0] }}
              </p>
            </div>
            <div class="col-span-2 space-y-1 border-t pt-3">
              <p class="text-sm text-gray-500 font-medium">{{ t('Reason') }}</p>
              <p class="text-sm text-gray-700 font-medium">
                {{ parsedPayload.reason || parsedPayload.Reason || '—' }}
              </p>
            </div>
            <div class="col-span-2 space-y-1 border-t pt-3">
              <p class="text-sm text-gray-500 font-medium">{{ t('Absence Type') }}</p>
              <p class="text-sm text-gray-700 font-medium capitalize">
                {{ parsedPayload.abcent || parsedPayload.Abcent || '—' }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="selectedChange?.reviewNote" class="space-y-2">
          <p class="text-sm text-gray-500">{{ t('Review Note') }}</p>
          <p class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
            {{ selectedChange.reviewNote }}
          </p>
        </div>
      </div>

      <DialogFooter class="p-5 bg-gray-50 border-t flex gap-3" v-if="selectedChange?.status === 'pending'">
        <Button
          variant="destructive"
          class="flex-1"
          @click="showRejectDialog = true"
          :disabled="approving || rejecting"
        >
          {{ t('Reject') }}
        </Button>
        <Button
          class="flex-1 bg-[#29A679] hover:bg-[#12B76A]/90"
          @click="handleApprove(selectedChange!.id)"
          :loading="approving"
          :disabled="approving || rejecting"
        >
          {{ t('Approve') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Reject Reason Dialog -->
  <Dialog v-model:open="showRejectDialog">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
      <button
        @click="showRejectDialog = false"
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
        <DialogTitle>{{ t('Reject Change') }}</DialogTitle>
        <DialogDescription class="mt-1">
          {{ t('Please provide a reason for rejecting this change.') }}
        </DialogDescription>
      </DialogHeader>
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1.5 block">
            {{ t('Reason...') }}
          </label>
          <textarea
            v-model="rejectReason"
            class="w-full min-h-[120px] p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            :placeholder="t('Reason...')"
          ></textarea>
        </div>
      </div>
      <DialogFooter class="p-5 bg-gray-50 border-t flex gap-3">
        <Button variant="outline" class="flex-1" @click="showRejectDialog = false">{{ t('cancel') }}</Button>
        <Button
          variant="destructive"
          class="flex-1"
          @click="handleReject"
          :loading="rejecting"
          :disabled="!rejectReason.trim()"
        >
          {{ t('Reject') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
