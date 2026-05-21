<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date'
import { useI18n } from 'vue-i18n'
import { refDebounced } from '@vueuse/core'
import { useCheckPermission } from '@/composables/useCheckPermission'
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-vue-next'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { CreateLeaveModel } from '../types'
import { createEmployeeLeave, uploadEmployeeLeaveAttachment } from '../api'
import { fetchEmployees } from '@/views/users/list/api'
import Can from '@/components/can.vue'

const { t } = useI18n()
const { hasPermission: hasEmployeesListPermission } = useCheckPermission('employees.list')
const queryClient = useQueryClient()
const openEmployees = ref(false)
const employeeSearch = ref('')
const debouncedEmployeeSearch = refDebounced(employeeSearch, 600)

const employeesParams = computed(() => ({
  size: 50,
  page: 1,
  search: debouncedEmployeeSearch.value,
  isAll: false
}))

// Employees fetch
const {
  data: employeesResponse,
  isLoading: loadingEmployees,
} = useQuery({
  queryKey: ['employees', employeesParams],
  queryFn: () => fetchEmployees(employeesParams.value),
  staleTime: 600000,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  enabled: hasEmployeesListPermission
})

const employees = computed(() => employeesResponse.value?.data?.data || [])

// Leave types (as select options now)
const leaveTypes = [
  { label: t('leave-types.AnnualLeave'), value: '1' },
  { label: t('leave-types.SickLeave'), value: '2' },
  { label: t('leave-types.BusinessTrip'), value: '7' },
  { label: t('leave-types.MaternityLeave'), value: '3' },
  { label: t('leave-types.UnpaidLeave'), value: '6' },
  { label: t('leave-types.PaidLeave'), value: '5' },
  { label: t('leave-types.PaternityLeave'), value: '4' },
  { label: t('leave-types.Other'), value: '0' }
]

const selectedValue = ref('')
const df = new DateFormatter('en-US', { dateStyle: 'long' })
const selectedEmployee = ref('')
const selectedEmployeeName = computed(() => {
  const emp = employees.value.find((e: any) => e.id.toString() === selectedEmployee.value)
  if (!emp) return t('employee')
  return emp.user
    ? `${emp.user.firstName} ${emp.user.lastName || ''}`
    : emp.comment || t('employee')
})
const from = ref<DateValue | undefined>()
const to = ref<DateValue | undefined>()
const open = ref(false)
const comment = ref('')
const file = ref<File | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const handleInput = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
}

const resetForm = () => {
  selectedEmployee.value = ''
  comment.value = ''
  file.value = null
  from.value = undefined
  to.value = undefined
  selectedValue.value = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!selectedEmployee.value) {
    errorMessage.value = t('pleaseSelectEmployee')
    return
  }
  if (!from.value || !to.value) {
    errorMessage.value = t('pleaseSelectDates')
    return
  }
  if (!selectedValue.value) {
    errorMessage.value = t('pleaseSelectLeaveType')
    return
  }
  if (!file.value) {
    errorMessage.value = t('pleaseUploadFile')
    return
  }

  loading.value = true

  const timeSuffix = 'T00:00:00Z'
  const startDate = `${from.value}${timeSuffix}`
  const endDate = `${to.value}${timeSuffix}`

  const payload: CreateLeaveModel = {
    employeeId: selectedEmployee.value,
    startDate,
    endDate,
    reason: comment.value,
    type: selectedValue.value
  }

  try {
    const response = await createEmployeeLeave(payload)
    const data = response.data

    if (data.isSuccess && data.data?.id) {
      const leaveId = data.data.id
      if (file.value) {
        try {
          await uploadEmployeeLeaveAttachment(leaveId, file.value, file.value.name)
        } catch {
          errorMessage.value = t('Leave created, but file upload failed.')
        }
      }
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['employee-leaves'] })
      open.value = false
    } else {
      errorMessage.value = data.error?.message || t('Failed to create leave.')
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || t('An error occurred.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <Can i="employee.leaves.add">
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
          {{ t('add-leave') }}
        </Button>
      </DialogTrigger>
    </Can>

    <DialogContent class="px-0 py-0 overflow-hidden">
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
        <DialogTitle>{{ t('add-leave') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('add-leave') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-5 px-5 pb-5" @submit.prevent="handleSubmit">
        <!-- Employee -->
        <div class="space-y-2 flex flex-col">
          <Label for="employee" class="text-grayx1 text-base">
            {{ t('employee') }} <span class="text-red-500">*</span>
          </Label>
          <Popover v-model:open="openEmployees" class="w-full">
            <PopoverTrigger asChild>
              <Button
                id="employee"
                variant="outline"
                role="combobox"
                :aria-expanded="openEmployees"
                class="w-full justify-between font-normal h-10 border-[#E0E6F0] rounded-lg"
              >
                {{ selectedEmployeeName }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-[--radix-popover-trigger-width] p-0 shadow-lg border-[#E0E6F0] rounded-lg"
              align="start"
            >
              <Command v-model:search-term="employeeSearch" :filter-results="false">
                <CommandInput
                  :placeholder="t('search')"
                  class="border-none focus:ring-0"
                  id="employee-search"
                  aria-label="Employee search"
                />
                <CommandList class="max-h-[300px] overflow-y-auto">
                  <CommandEmpty v-if="!loadingEmployees">{{ t('no-data') }}</CommandEmpty>
                  <CommandEmpty v-else>{{ t('loading') }}...</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="employee in employees"
                      :key="employee.id"
                      :value="`${employee.user?.firstName || ''} ${employee.user?.lastName || ''} ${employee.comment || ''} ${employee.id}`"
                      @select="
                        () => {
                          selectedEmployee = employee.id.toString()
                          openEmployees = false
                          employeeSearch = ''
                        }
                      "
                      class="cursor-pointer hover:bg-gray-50"
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            selectedEmployee === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                          )
                        "
                      />
                      {{
                        employee.user
                          ? `${employee.user.firstName} ${employee.user.lastName || ''}`
                          : employee.comment
                      }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <!-- Leave Type -->
        <div class="space-y-2">
          <Label for="leaveType" class="text-grayx1 text-base">
            {{ t('leave-type') }} <span class="text-red-500">*</span>
          </Label>
          <Select v-model="selectedValue" id="leaveType">
            <SelectTrigger id="leaveType" name="leaveType">
              <SelectValue :placeholder="t('select-leave-type')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in leaveTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-x-2">
          <div class="flex flex-col space-y-2">
            <Label for="fromDate" class="text-grayx1 text-base">
              {{ t('from') }} <span class="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  id="fromDate"
                  name="fromDate"
                  variant="outline"
                  :class="
                    cn('justify-start text-left font-normal', !from && 'text-muted-foreground')
                  "
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ from ? df.format(from.toDate(getLocalTimeZone())) : t('from') }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="from" />
              </PopoverContent>
            </Popover>
          </div>

          <div class="flex flex-col space-y-2">
            <Label for="toDate" class="text-grayx1 text-base">
              {{ t('to') }} <span class="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  id="toDate"
                  name="toDate"
                  variant="outline"
                  :class="cn('justify-start text-left font-normal', !to && 'text-muted-foreground')"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ to ? df.format(to.toDate(getLocalTimeZone())) : t('to') }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="to" :minValue="from" />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <!-- Comment -->
        <div class="space-y-2">
          <Label for="comment" class="text-grayx1 text-base">{{ t('comment') }}</Label>
          <Textarea
            id="comment"
            name="comment"
            v-model="comment"
            :placeholder="t('comment')"
            ref="textareaRef"
            @input="handleInput"
            rows="1"
            class="min-h-[0px] resize-none"
          />
        </div>

        <!-- File Upload -->
        <div class="space-y-2">
          <Label for="file" class="text-grayx1 text-base">{{ t('drag-drop-file-desc') }} <span class="text-red-500">*</span></Label>
          <Input id="file" class="cursor-pointer pt-[6px]" type="file" @change="onFileChange" />
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</div>

        <Button
          type="submit"
          class="bg-[#12B76A] hover:bg-[#12B76A] text-base hover:opacity-90 transition-all w-full h-10 rounded-lg border border-[#12B76A]"
          :disabled="loading"
        >
          {{ loading ? t('Submitting...') : t('save') }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
