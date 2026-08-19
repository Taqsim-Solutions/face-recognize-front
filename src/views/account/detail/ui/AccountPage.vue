<script setup lang="ts">
import { computed } from 'vue'
import { useGetAccountInfo } from '../queries/useGetAccountInfo'
import { useI18n } from 'vue-i18n'
import {
  UserIcon, MailIcon, KeyIcon, ShieldIcon,
  MapPinIcon, SchoolIcon, BookOpenIcon, BuildingIcon
} from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useGetAccountInfo()

const fullName = computed(() => {
  if (!data.value) return ''
  return `${data.value.lastName || ''} ${data.value.firstName || ''}`.trim()
})

const initials = computed(() => {
  const f = data.value?.firstName?.[0] || ''
  const l = data.value?.lastName?.[0] || ''
  return (l + f).toUpperCase()
})

const roleName = computed(() => {
  const level = data.value?.level
  const map: Record<number, string> = {
    1: t('roles.teacher', "O'qituvchi"),
    2: t('roles.director', 'Direktor'),
    3: t('roles.district', 'Tuman'),
    4: t('roles.region', 'Viloyat'),
    5: t('roles.admin', 'Admin')
  }
  return map[level] || '-'
})

const roleColor = computed(() => {
  const level = data.value?.level
  const colors: Record<number, string> = {
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-green-100 text-green-700',
    3: 'bg-purple-100 text-purple-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700'
  }
  return colors[level] || 'bg-gray-100 text-gray-700'
})
</script>

<template>
  <div class="p-6 max-w-2xl">
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-32 rounded-2xl bg-gray-100 animate-pulse" />
      <div class="h-16 rounded-xl bg-gray-100 animate-pulse" />
      <div class="h-16 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="data">
      <!-- Header card -->
      <div class="bg-gradient-to-br from-[#ff792d] to-[#e05e1a] rounded-2xl p-6 mb-6 text-white">
        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
            {{ initials || '?' }}
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ fullName || '-' }}</h2>
            <p class="text-orange-100 text-sm mt-0.5">{{ data.email }}</p>
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block', roleColor]">
              {{ roleName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="space-y-3">

        <!-- Personal info -->
        <div class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          <div class="flex items-center gap-3 px-4 py-3">
            <UserIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('lastName') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.lastName || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <UserIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('firstName') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.firstName || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <MailIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('email') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.email || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <KeyIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('phone-login', 'Telefon raqam (login)') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.login || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <ShieldIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('role') }}</span>
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', roleColor]">{{ roleName }}</span>
          </div>
        </div>

        <!-- Location info -->
        <div v-if="data.region || data.city || data.schoolName" class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          <div v-if="data.region" class="flex items-center gap-3 px-4 py-3">
            <MapPinIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('region') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.region?.name || '-' }}</span>
          </div>
          <div v-if="data.city" class="flex items-center gap-3 px-4 py-3">
            <BuildingIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('city-label') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.city?.name || '-' }}</span>
          </div>
          <div v-if="data.schoolName" class="flex items-center gap-3 px-4 py-3">
            <SchoolIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('school') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ data.schoolName }}</span>
          </div>
          <div v-if="data.classId" class="flex items-center gap-3 px-4 py-3">
            <BookOpenIcon class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs text-gray-400 w-28 shrink-0">{{ t('sinf') }}</span>
            <span class="text-sm font-medium text-gray-800">{{ t('sinf') }} {{ data.classId }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
