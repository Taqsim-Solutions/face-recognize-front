<script setup lang="ts">
import * as z from 'zod'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useGetUserById } from '../query/useGetUserById'
import { useUpdateEmployee } from '../query/useEditEmployee'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const {
  data: user,
  error: userError,
  isLoading: isUserLoading,
  isError: isUserError
} = useGetUserById({ id })

const formSchema = toTypedSchema(
  z.object({
    firstName: z.string({ message: 'validation.required-field' }),
    lastName: z.string({ message: 'validation.required-field' }),
    login: z.string({ message: 'validation.required-field' }),
    email: z.string({ message: 'validation.required-field' }).email('validation.email-should-be-valid')
  })
)

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: formSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    login: '',
    email: ''
  }
})

watch(user, (newData) => {
  if (newData) {
    const userData = newData.result || newData.data || newData
    resetForm({
      values: {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        login: userData.login || '',
        email: userData.email || ''
      }
    })
  }
})

const { isPending, mutate } = useUpdateEmployee()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id, payload: values as any },
    {
      onError: () => {
        toast.error(t('error-occurred', 'Error occurred'))
      },
      onSuccess: () => {
        toast.success(t('success.employee-updated', 'User updated successfully'))
        router.push({ name: 'users-list' })
      }
    }
  )
})
</script>

<template>
  <header class="flex items-center justify-between mb-6 px-6">
    <h2
      class="mt-10 scroll-m-20 lg:text-3xl text-2xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {{ t('edit-employee', 'Edit User') }}
    </h2>
  </header>

  <div v-if="isUserLoading" class="px-6">
    <p>{{ t('loading') }}...</p>
  </div>

  <div v-else-if="isUserError" class="px-6">
    <pre>{{ userError }}</pre>
  </div>

  <form
    v-else
    @submit="onSubmit"
    class="rounded-lg p-6 border max-w-[600px] space-y-4 mx-6"
  >
    <FormField v-slot="{ componentField }" name="firstName">
      <FormItem>
        <FormLabel>{{ t('firstName', 'First Name') }}</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="lastName">
      <FormItem>
        <FormLabel>{{ t('lastName', 'Last Name') }}</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="login">
      <FormItem>
        <FormLabel>{{ t('login', 'Login') }}</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>{{ t('email', 'Email') }}</FormLabel>
        <FormControl>
          <Input type="email" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex gap-2 justify-end mt-4">
      <Button type="submit" :loading="isPending" :disabled="!meta.valid"> 
        {{ t('save', 'Save') }} 
      </Button>
    </div>
  </form>
</template>
