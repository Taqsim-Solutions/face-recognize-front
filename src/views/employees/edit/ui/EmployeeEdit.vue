<script setup lang="ts">
import type { EmployeeUpdatePayload } from '../types'
import * as z from 'zod'
import { vMaska } from 'maska/vue'
import { watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useGetEmployeeById } from '../../detail/query/useGetEmployeeById'
import { useUpdateEmployee } from '../query/useEditEmployee'
import { updateEmployeeSalary } from '../api'
import { cn } from '@/lib/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray, useForm } from 'vee-validate'
import { Cross1Icon } from '@radix-icons/vue'
import { CreditCardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAddCardNumber } from '../query/useAddCardNumber'
import { useDeleteCardNumber } from '../query/useDeleteCardNumber'

// Modal imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string
const { mutate: addCardNumber } = useAddCardNumber(id)
const { mutate: deleteCardNumber } = useDeleteCardNumber(id)

const {
  data: employee,
  error: employeeError,
  isLoading: isEmployeeLoading,
  isError: isEmployeeError
} = useGetEmployeeById({ id })

const formSchema = toTypedSchema(
  z.object({
    phoneNumber: z
      .string({ message: 'validation.required-field' })
      .length(19, { message: 'validation.phone-number-should-be-valid' })
      .default('+998'),
    salary: z.number({ message: 'validation.required-field' }),
    percentAllowed: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(80, { message: 'validation.max-allowed-percent-amount' }),
    fte: z.coerce
      .number({ message: 'validation.required-field' })
      .min(0.1, { message: 'validation.fte-should-be-valid' })
      .max(3, { message: 'validation.fte-should-be-valid' }),
    comment: z.string({ message: 'validation.required-field' }),
    status: z.enum(['active', 'blocked', 'leftTheCompany'], {
      message: 'validation.required-field'
    }),
    contractType: z.enum(['staff', 'gph'], { message: 'validation.required-field' }),
    cardNumbers: z
      .array(
        z.object({
          value: z.string().length(19, { message: 'validation.card-number-should-be-valid' })
        })
      )
      .optional()
  })
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    status: undefined,
    comment: '',
    salary: 0,
    percentAllowed: 0,
    fte: 1,
    contractType: 'staff'
  }
})

watch(employee, (newData) => {
  if (newData) {
    const employee = newData.data.data
    resetForm({
      values: {
        status: employee.status,
        comment: employee.comment,
        salary: employee.grossSalary,
        phoneNumber: employee.identifiers?.find((i) => i.type === 'phoneNumber')?.value,
        percentAllowed: employee.percentAllowed,
        fte: employee.fte ?? 1,
        contractType: employee.contractType || 'staff'
      }
    })
  }
})

const { isPending, mutate } = useUpdateEmployee()

const onSubmit = handleSubmit((values) => {
  const { cardNumbers, ...restValues } = values

  const cardNumbersPayload = cardNumbers
    ?.filter((card) => card.value)
    .map((card) => card.value.replace(/\s+/g, ''))

  const payload: EmployeeUpdatePayload = {
    ...restValues,
    ...(cardNumbersPayload?.length ? { cardNumbers: cardNumbersPayload } : {}),
    phoneNumber: values.phoneNumber.replace(/\D+/g, ''),
  }

  mutate(
    { id, payload },
    {
      onError: () => {},
      onSuccess: async () => {
        try {
          await updateEmployeeSalary({ id, payload: { salary: values.salary } })
          toast.success(t('success.employee-updated'))
          router.push({ name: 'employees-detail', params: { id } })
        } catch (error) {
          toast.error(t('error.salary-update-failed'))
        }
      }
    }
  )
})

function handleAddCardNumber(cardNumber: string) {
  addCardNumber(
    { id, cardNumber: cardNumber.replace(/\s+/g, '') },
    {
      onSuccess: () => toast.success(t('success.employee-updated')),
      onError: () => toast.error(t('error.card-add'))
    }
  )
}

function handleDeleteCard(cardNumberId: string) {
  deleteCardNumber(
    { id, cardNumberId },
    {
      onSuccess: () => toast.success(t('success.employee-updated')),
      onError: () => toast.error(t('error.card-delete'))
    }
  )
}

// === Confirm Delete Modal Logic ===
const showDeleteModal = ref(false)
const selectedCardId = ref<string | null>(null)

function confirmDeleteCard(cardId: string) {
  selectedCardId.value = cardId
  showDeleteModal.value = true
}

function deleteConfirmedCard() {
  if (selectedCardId.value) {
    handleDeleteCard(selectedCardId.value)
  }
  showDeleteModal.value = false
  selectedCardId.value = null
}

</script>

<template>
  <header class="flex items-center justify-between mb-6 px-6">
    <h2
      class="mt-10 scroll-m-20 lg:text-3xl text-2xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {{ t('edit-employee') }}
    </h2>
    <div class="flex items-center gap-4">
      {{ employee?.data.data.user?.firstName }} {{ employee?.data.data.user?.lastName }}
    </div>
  </header>
  <div v-if="isEmployeeLoading">
    <p>{{ t('loading') }}...</p>
  </div>

  <div v-else-if="isEmployeeError">
    <pre>
      {{ employeeError }}
    </pre>
  </div>
  <form
    v-else
    ref="formRef"
    @submit="onSubmit"
    class="rounded-lg p-4 border max-w-[600px] space-y-4 mx-6"
  >
    <FormField v-slot="{ componentField }" name="phoneNumber">
      <FormItem>
        <FormLabel>{{ t('phone-number') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            v-bind="componentField"
            v-maska="'+998 (##) ###-##-##'"
            placeholder="+998 90 123 45 67"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="salary">
      <FormItem>
        <FormLabel>{{ t('salary') }}</FormLabel>
        <FormControl>
          <Input
            type="number"
            :placeholder="t('enter-salary')"
            v-bind="componentField"
            :disabled="isPending"
          />
        </FormControl>
        <FormDescription> </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="percentAllowed">
      <FormItem>
        <FormLabel>{{ t('allowed-percent') }}</FormLabel>
        <FormControl>
          <Input
            type="number"
            max="80"
            min="0"
            :placeholder="t('enter-allowed-percent')"
            v-bind="componentField"
            :disabled="isPending"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="fte">
      <FormItem>
        <FormLabel>{{ t('fte') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            inputmode="decimal"
            step="0.05"
            max="3"
            min="0.1"
            :placeholder="t('fte')"
            v-bind="componentField"
            :disabled="isPending"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="status">
      <FormItem>
        <FormLabel>Status</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger :disabled="isPending">
              <SelectValue :placeholder="t('select-status')" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active"> {{ t('active') }} </SelectItem>
              <SelectItem value="blocked"> {{ t('blocked') }} </SelectItem>
              <SelectItem value="leftTheCompany">{{ t('left-the-company') }} </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription></FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="contractType">
      <FormItem>
        <FormLabel>{{ t('contract-type') }}</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger :disabled="isPending">
              <SelectValue :placeholder="t('select-contract-type')" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="staff"> {{ t('staff') }} </SelectItem>
              <SelectItem value="gph"> {{ t('gph') }} </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="comment">
      <FormItem class="">
        <FormLabel>{{ t('comment') }}</FormLabel>
        <FormControl>
          <Textarea
            :placeholder="`${t('comment')}...`"
            class="resize-y"
            v-bind="componentField"
            :disabled="isPending"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div>
      <FieldArray v-slot="{ fields, remove }" name="cardNumbers">
        <div v-for="(field, index) in fields" :key="`cardNumbers-${field.key}`">
          <FormField v-slot="{ componentField, value }" :name="`cardNumbers[${index}].value`">
            <FormItem>
              <FormLabel :class="cn(index !== 0 && 'sr-only')">{{ t('card-numbers') }}</FormLabel>
              <div class="relative flex items-center">
                <FormControl>
                  <Input
                    type="text"
                    v-bind="componentField"
                    v-maska="'#### #### #### ####'"
                    :disabled="isPending"
                  />
                </FormControl>
                <button
                  type="button"
                  class="absolute py-2 pe-3 end-0 text-muted-foreground"
                  @click="remove(index)"
                >
                  <Cross1Icon class="w-3" />
                </button>
              </div>
              <div class="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  class="text-xs px-4 py-1 rounded-md shadow-sm transition-all mt-2 hover:bg-secondary/80"
                  @click="() => handleAddCardNumber(value)"
                >
                  {{ t('save-card') }}
                </Button>
              </div>
            </FormItem>
          </FormField>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          class="text-xs mt-2"
          @click="
            () =>
              fields.push({
                value: '',
                key: '',
                isFirst: false,
                isLast: false
              })
          "
        >
          {{ t('add-field-for-card') }}
        </Button>
      </FieldArray>
    </div>

    <div class="flex gap-2 justify-end">
      <Button type="submit" :loading="isPending"> {{ t('save') }} </Button>
    </div>
  </form>

  <div class="mt-10 max-w-[600px] border rounded-lg p-4 mx-6">
    <div class="flex items-center justify-between mb-5 border-b-2">
      <h3 class="text-xl font-medium">{{ t('cads-list') }}</h3>
      <CreditCardIcon :size="24" />
    </div>
    <template v-if="employee && employee.data.data?.cardNumbers?.length">
      <div
        v-for="card in employee.data.data.cardNumbers"
        class="flex items-center justify-between pb-4 gap-x-1"
      >
        <div>
          <p class="font-semibold">{{ card.maskedNumber }}</p>
        </div>
        <Button variant="destructive" size="icon" @click="() => confirmDeleteCard(card.id)">
          <Cross1Icon />
        </Button>
      </div>
    </template>
    <template v-else>
      <p class="text-muted-foreground italic">
        {{ t('list-empty') }}
      </p>
    </template>
  </div>
  <Dialog v-model:open="showDeleteModal">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('confirm-delete') }}</DialogTitle>
        <DialogDescription>
          {{ t('are-you-sure-you-want-to-delete-this-card') }}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="mt-4 flex justify-end gap-2">
        <DialogClose as-child>
          <Button variant="outline">{{ t('cancel') }}</Button>
        </DialogClose>
        <Button variant="destructive" @click="deleteConfirmedCard">{{ t('delete') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

</template>
