<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { createEmployee } from '../api'

import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'

const { t } = useI18n()

const formSchema = z.object({
  firstName: z.string({ message: 'validation.required-field' }),
  lastName: z.string({ message: 'validation.required-field' }),
  login: z.string({ message: 'validation.required-field' }),
  email: z.string({ message: 'validation.required-field' }).email('validation.email-should-be-valid'),
  password: z.string({ message: 'validation.required-field' }),
  level: z.coerce.number().default(1)
})

type FormValues = z.infer<typeof formSchema>

type ErrorResponse = {
  data: {
    error: {
      code?: string
      errors?: string[]
      message?: string
    }
    isSuccess: boolean
    status: number
  }
}

const router = useRouter()
const { isPending, mutate } = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    toast.success(t('success.employee-added', 'User created successfully'))
    router.push({ name: 'users-list' })
  },
  onError: (error: AxiosError) => {
    const errorRes = error.response as ErrorResponse

    if (errorRes?.data?.error?.errors) {
      toast.error(t(errorRes.data.error.errors[0]))
    } else {
      toast.error(t('error-occurred', 'Error occurred'))
    }
  }
})

const onSubmit = async (values: FormValues) => {
  mutate(values as any)
}
</script>

<template>
  <div>
    <header class="flex items-center justify-between mb-6">
      <h2
        class="mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
      >
        {{ t('new-employee-add', 'New User') }}
      </h2>
    </header>

    <Form
      v-slot="{ meta, values }"
      @submit="onSubmit"
      :validation-schema="toTypedSchema(formSchema)"
    >
      <div class="block w-full border p-6 rounded-lg max-w-[500px] flex flex-col gap-4">
        
        <FormField v-slot="{ componentField }" name="firstName">
          <FormItem>
            <FormLabel>{{ t('firstName', 'First Name') }}</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="John" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="lastName">
          <FormItem>
            <FormLabel>{{ t('lastName', 'Last Name') }}</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="Doe" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="login">
          <FormItem>
            <FormLabel>{{ t('login', 'Login') }}</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="johndoe" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>{{ t('email', 'Email') }}</FormLabel>
            <FormControl>
              <Input type="email" v-bind="componentField" placeholder="john@example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>{{ t('password', 'Password') }}</FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" placeholder="********" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="level">
          <FormItem>
            <FormLabel>{{ t('level', 'Level') }}</FormLabel>
            <FormControl>
              <Input type="number" v-bind="componentField" placeholder="1" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="flex justify-end mt-4">
          <Button type="submit" :loading="isPending" :disabled="!meta.valid">
            {{ t('confirm', 'Confirm') }}
          </Button>
        </div>
      </div>
    </Form>
  </div>
</template>
