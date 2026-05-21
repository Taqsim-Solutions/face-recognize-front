<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useGetEmployeeById } from '../query/useGetEmployeeById'
import { useGetEmployeeSalary } from '../query/useGetEmployeeSalary'
import { prettifyPhoneNumber, prettify } from '@/lib/utils'
import { identifiersList } from './identifiersList'
import Can from '@/components/can.vue'
import { Button } from '@/components/ui/button'
import { DeleteEmployeeDialog } from '../modules'
import { updateEmployeeOptions } from '../../edit/api'
import { getOrganizationOptions } from '../../../organization-settings/api'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import { ClockIcon } from '@radix-icons/vue'
import { Input } from '@/components/ui/input'
import EmployeeImages from '../modules/EmployeeImages.vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const { data: employee, isLoading, refetch } = useGetEmployeeById({ id })
const { data: salary } = useGetEmployeeSalary({ id })

const userName = computed(() =>
  employee.value?.data.data.user
    ? `${employee.value.data.data.user.lastName} ${employee.value.data.data.user.firstName}`
    : false
)
const identificationItems = computed(() => {
  let temp: { label: string; value: string | undefined }[] = []
  if (employee.value) {
    identifiersList.forEach((el) => {
      let fieldVal: string | undefined = ''
      if (employee.value.data.data.identifiers) {
        fieldVal = employee.value.data.data.identifiers.find((v: any) => v.type === el.fieldName)?.value

        if (el.fieldName === 'phoneNumber' && fieldVal) {
          fieldVal = prettifyPhoneNumber(fieldVal)
        }
      }
      temp.push({
        label: el.label,
        value: fieldVal
      })
    })
  }
  return temp
})

const dailyWithdrawalLimit = computed(() => {
  if (salary.value && employee.value) {
    return (salary.value.data.data.salaryPerDay * employee.value.data.data.percentAllowed) / 100
  }
  return 0
})

// === Options Modal Logic ===
const showOptionsModal = ref(false)
const optionsForm = ref({
  workStartTime: '',
  workEndTime: ''
})

async function openOptionsModal() {
  if (employee.value) {
    optionsForm.value.workStartTime = employee.value.data.data.options?.workStartTime || ''
    optionsForm.value.workEndTime = employee.value.data.data.options?.workEndTime || ''

    if (!optionsForm.value.workStartTime && !optionsForm.value.workEndTime) {
      try {
        const res = await getOrganizationOptions()
        const orgData = res.data.data
        optionsForm.value.workStartTime = orgData.dayShiftWorkStartTime || ''
        optionsForm.value.workEndTime = orgData.dayShiftWorkEndTime || ''
      } catch (error) {
        console.error(error)
      }
    }
  }
  showOptionsModal.value = true
}

const isOptionsPending = ref(false)

async function handleUpdateOptions() {
  isOptionsPending.value = true
  try {
    await updateEmployeeOptions({
      id,
      payload: {
        workStartTime: optionsForm.value.workStartTime || null,
        workEndTime: optionsForm.value.workEndTime || null
      }
    })
    toast.success(t('success.employee-updated'))
    showOptionsModal.value = false
    refetch()
  } catch (error) {
    toast.error(t('error-occurred'))
  } finally {
    isOptionsPending.value = false
  }
}

// Removed showSalaryPeriods ref as accordion is removed

const workTimeDisplay = computed(() => {
  const start = employee.value?.data.data.options?.workStartTime
  const end = employee.value?.data.data.options?.workEndTime
  if (!start || !end) return null

  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  let diff = h2 * 60 + m2 - (h1 * 60 + m1)
  if (diff < 0) diff += 24 * 60

  const diffHours = Math.floor(diff / 60)
  const diffMinutes = diff % 60

  let durationStr = `${diffHours} ${t('hours')}`
  if (diffMinutes > 0) durationStr += ` ${diffMinutes} ${t('minutes')}`

  return `${start} - ${end} (${durationStr})`
})
</script>

<template>
  <div v-if="isLoading">
    <div class="flex items-center justify-center mb-6 py-3 text-xl">
      <p>{{ t('loading') }}</p>
    </div>
  </div>

  <template v-else>
    <div class="border-b border-gray-300/60 px-6 flex flex-col lg:flex-row lg:items-center justify-between mb-5 pb-3.5 gap-4">
      <div class="flex items-center space-x-4 overflow-hidden">
        <Button
          variant="outline"
          size="sm"
          @click="router.push({ name: 'employees-list' })"
          class="text-[#596881] transition-colors border h-9 w-9 opacity-100 rounded-xl border-[#E0E6F0] shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            style="transform: scale(1.8)"
          >
            <path
              d="M3.33337 8.00016H12.6667M3.33337 8.00016L6.00004 10.6668M3.33337 8.00016L6.00004 5.3335"
              stroke="#596881"
              stroke-width="1.56"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
        <div class="flex items-center gap-2.5 overflow-hidden">
          <RouterLink to="/employees" class="shrink-0">
            <p class="text-lg font-bold text-[#8796AF] bg-clip-text">
              {{ t('employees') }}
            </p></RouterLink
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            class="shrink-0"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="#8796AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p
            v-if="employee"
            class="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate"
          >
            {{ userName ? userName : employee?.data.data.comment }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Can i="employees.update">
          <Button
            class="bg-green hover:bg-green hover:opacity-80 transition-all rounded-lg gap-1 px-3 border-none flex-1 lg:flex-none justify-center"
            @click="router.push({ name: 'employees-edit', params: { id } })"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M9.00033 4.33341L11.667 7.00008M2.66699 13.3335H5.33366L12.3337 6.33345C12.6873 5.97983 12.8859 5.50022 12.8859 5.00012C12.8859 4.50002 12.6873 4.02041 12.3337 3.66679C11.98 3.31316 11.5004 3.1145 11.0003 3.1145C10.5002 3.1145 10.0206 3.31316 9.66699 3.66679L2.66699 10.6668V13.3335Z"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('edit') }}
          </Button>
        </Can>

        <Can i="employees.update">
          <Button
            class="rounded-lg gap-1 px-3 border-none text-white bg-primary flex-1 lg:flex-none justify-center"
            @click="openOptionsModal"
          >
            <ClockIcon class="w-4 h-4" />
            <span class="whitespace-nowrap">{{ t('edit-work-hours') }}</span>
          </Button>
        </Can>
        <Can i="employees.delete" class="flex-1 lg:flex-none">
          <DeleteEmployeeDialog :id="id" class="w-full" />
        </Can>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 max-w-[1600px] pb-10 px-6">
      <div>
        <div class="border border-[#E0E6F0] rounded-lg mb-6">
          <h3
            class="text-lg text-[#111625] font-bold p-4 border-[#E0E6F0] border-b flex items-center flex-wrap gap-2"
          >
            {{ t('identification-details') }}
            <span
              class="inline-block bg-[#EFF3F8] px-4 py-1.5 text-sm lg:ml-auto rounded-xl"
              v-if="!employee?.data.data.user"
            >
              {{ t('user-not-yet-registered') }}
            </span>
          </h3>
          <div class="grid gap-5 p-4">
            <template v-if="identificationItems.length">
              <div
                v-for="item in identificationItems"
                :key="item.label"
                class="flex items-center justify-between gap-x-1"
              >
                <p class="text-[#596881]">{{ t(item.label) }}:</p>
                <p class="text-[#111625] font-medium">
                  {{ item.value || t('no-data') }}
                </p>
              </div>
            </template>
            <template v-else>
              <p class="text-muted-foreground">{{ t('no-data') }}</p>
            </template>
          </div>
        </div>

        <div class="border border-[#E0E6F0] rounded-lg">
          <h3 class="text-lg text-[#111625] font-bold p-4 border-[#E0E6F0] border-b">
            {{ t('cads-list') }}
          </h3>
          <div class="grid gap-5 p-4">
            <template v-if="employee?.data.data.cardNumbers?.length">
              <div
                v-for="(card, cardIdx) in employee.data.data.cardNumbers"
                :key="cardIdx"
                class="flex items-center justify-between gap-x-1"
              >
                <p class="text-[#596881]">{{ t('card-number') }}:</p>
                <p class="text-[#111625] font-medium">
                  {{ card.maskedNumber }}
                </p>
              </div>
            </template>
            <template v-else>
              <p class="text-muted-foreground">{{ t('no-data') }}</p>
            </template>
          </div>
        </div>

        
        <div class="border border-[#E0E6F0] rounded-lg mt-6">
          <h3 class="text-lg text-[#111625] font-bold p-4 border-[#E0E6F0] border-b">
            {{ t('comment') }}
          </h3>
          <div class="grid gap-5 p-4">
            <p>{{ employee?.data.data.comment }}</p>
          </div>
        </div>

        <EmployeeImages :employee-id="id" />
      </div>

      <div class="grid gap-6">
        <div class="border border-[#E0E6F0] rounded-lg">
          <h3 class="text-lg text-[#111625] font-bold p-4 border-[#E0E6F0] border-b">
            {{ t('salary-details') }}
          </h3>
          <div class="grid gap-5 p-4">
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ employee ? `${prettify(employee.data.data.grossSalary || employee.data.data.salary)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('net-salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ employee ? `${prettify(employee.data.data.salary)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('allowed-percent') }}:</p>
              <p class="text-[#111625] font-medium">{{ employee?.data.data.percentAllowed }}%</p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('contract-type') }}:</p>
              <p class="text-[#111625] font-medium">
                {{
                  employee?.data.data.contractType === 'gph' ? t('gph') : t('staff')
                }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('fte') }}:</p>
              <p class="text-[#111625] font-medium">{{ employee?.data.data.fte ?? 1 }}</p>
            </div>
            <div v-if="workTimeDisplay" class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('work-time') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ workTimeDisplay }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('enabled-salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary ? `${prettify(salary?.data.data.enableSalary)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('earned-salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary ? `${prettify(salary.data.data.earnedSalary)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div
              v-if="!salary?.data.data.salaryPeriods?.isAdvance"
              class="flex items-center justify-between gap-x-1"
            >
              <p class="text-[#596881]">{{ t('salary-per-day') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary ? `${prettify(salary.data.data.salaryPerDay)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('daily-withdrawable-amount') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ `${prettify(dailyWithdrawalLimit)} ${t('currency')}` }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('requested-salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{
                  salary ? `${prettify(salary.data.data.requestedSalary)} ${t('currency')}` : '0'
                }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('paid-salary') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary ? `${prettify(salary.data.data.paidSalary)} ${t('currency')}` : '0' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('working-days-in-month') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary?.data.data.workingDaysInMonth }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('worked-days-till-today') }}:</p>
              <p class="text-[#111625] font-medium">
                {{ salary?.data.data.workedDaysToToday }}
              </p>
            </div>
            <template v-if="salary?.data.data.salaryPeriods">
              <div>
                <div class="grid gap-3 transition-all">
                  <div
                    v-for="(period, idx) in salary.data.data.salaryPeriods.salaryPeriods"
                    :key="idx"
                    class="bg-[#F8FAFC] border rounded-xl p-3.5 relative overflow-hidden group transition-all"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <p class="text-[#111625] font-bold text-sm uppercase tracking-wide">
                        {{
                          period.periodType === 'beforeAdvance'
                            ? t('advance-period')
                            : t('salary-period')
                        }}
                      </p>
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                        :class="
                          period.periodType === 'beforeAdvance'
                            ? 'bg-[#EBF9F4] text-[#38C793]'
                            : 'bg-[#F1F5F9] text-[#596881]'
                        "
                      >
                        {{ period.percent }}%
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <p class="text-xs text-[#8796AF] font-medium uppercase">
                          {{ t('salary-per-day') }}
                        </p>
                        <p class="text-[#111625] font-bold text-base">
                          {{ prettify(period.dailySalary) }}
                          <span class="text-xs font-medium text-[#8796AF]">{{
                            t('currency')
                          }}</span>
                        </p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-xs text-[#8796AF] font-medium uppercase">
                          {{ t('working-days') }}
                        </p>
                        <p class="text-[#111625] font-bold text-base">{{ period.workingDays }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            
            <div class="flex items-start justify-between gap-x-1">
              <p class="text-[#596881]">{{ t('status') }}:</p>
              <p
                v-if="employee"
                class="font-medium px-3 py-1 rounded-2xl"
                :class="
                  employee.data.data.status === 'active'
                    ? 'border border-[#38C793] text-[#38C793] bg-[#EBF9F4]'
                    : 'border border-[#DF1C41] text-[#DF1C41] bg-[#FDEDEE]'
                "
              >
                {{
                  employee.data.data.status === 'active'
                    ? t('active')
                    : employee.data.data.status === 'blocked'
                    ? t('blocked')
                    : t('left-the-company')
                }}
              </p>
              <p v-else class="text-muted-foreground italic">{{ t('no-data') }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </template>


  <Dialog v-model:open="showOptionsModal">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('edit-work-hours') }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">{{ t('work-start-time') }}</label>
            <Input type="time" v-model="optionsForm.workStartTime" :disabled="isOptionsPending" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">{{ t('work-end-time') }}</label>
            <Input type="time" v-model="optionsForm.workEndTime" :disabled="isOptionsPending" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showOptionsModal = false" :disabled="isOptionsPending">
          {{ t('cancel') }}
        </Button>
        <Button @click="handleUpdateOptions" :loading="isOptionsPending">
          {{ t('save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
