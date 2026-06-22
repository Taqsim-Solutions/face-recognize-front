<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-vue-next'
import {
  defaultPagePermissions, fetchPagePermissions, savePagePermissions, refreshPagePermissions
} from '@/shared/permissions'

const { t } = useI18n()

// Pages to show in the matrix (key + human label). Order matters for display.
const pages: { key: string; label: string }[] = [
  { key: 'home', label: t('home', 'Bosh sahifa') },
  { key: 'students-list', label: t('students', 'O\'quvchilar') },
  { key: 'attendances-list', label: t('attendances', 'Davomat') },
  { key: 'absences', label: t('absences', 'Kelmaganlik sababi') },
  { key: 'reports', label: t('reports', 'Hisobotlar') },
  { key: 'unknown-faces', label: t('unknown-faces', 'Notanish yuzlar') },
  { key: 'teachers-list', label: t('teachers', 'O\'qituvchilar') },
  { key: 'schools-list', label: t('schools', 'Maktablar') },
  { key: 'governments-list', label: t('governments', 'Hokimliklar') },
  { key: 'users-list', label: t('users', 'Foydalanuvchilar') },
  { key: 'organization-settings', label: t('settings', 'Sozlamalar') }
]

// Admin (level 5) is intentionally excluded — admins always have full access and
// are not configurable here. Level 5 is force-added on save below.
const roles: { level: number; label: string }[] = [
  { level: 1, label: t('role-teacher', 'O\'qituvchi') },
  { level: 2, label: t('role-director', 'Direktor') },
  { level: 3, label: t('role-district', 'Tuman') },
  { level: 4, label: t('role-region', 'Viloyat') }
]

// Local editable matrix: pageKey → Set-like record of level→boolean
const matrix = ref<Record<string, Record<number, boolean>>>({})
const loading = ref(false)
const saving = ref(false)

function buildFrom(source: Record<string, number[]>) {
  const m: Record<string, Record<number, boolean>> = {}
  for (const p of pages) {
    const allowed = source[p.key] ?? defaultPagePermissions[p.key] ?? [1, 2, 3, 4, 5]
    m[p.key] = {}
    for (const r of roles) m[p.key][r.level] = allowed.includes(r.level)
  }
  matrix.value = m
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchPagePermissions()
    const remote = (res as any)?.data?.result || (res as any)?.result || {}
    buildFrom(remote && Object.keys(remote).length ? remote : defaultPagePermissions)
  } catch {
    buildFrom(defaultPagePermissions)
  } finally {
    loading.value = false
  }
})

const toggle = (pageKey: string, level: number) => {
  matrix.value[pageKey][level] = !matrix.value[pageKey][level]
}

const resetDefaults = () => buildFrom(defaultPagePermissions)

const save = async () => {
  saving.value = true
  try {
    const payload: Record<string, number[]> = {}
    for (const p of pages) {
      const levels = roles.filter((r) => matrix.value[p.key][r.level]).map((r) => r.level)
      // Admin (5) always has access — keep it in every page regardless of the UI.
      if (!levels.includes(5)) levels.push(5)
      payload[p.key] = levels
    }
    await savePagePermissions(payload)
    await refreshPagePermissions()
    toast.success(t('saved', 'Saqlandi'))
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-1">
      <h2 class="text-base font-semibold text-gray-800">{{ t('page-permissions', 'Sahifa ruxsatlari') }}</h2>
      <Button variant="ghost" class="h-8 text-xs text-gray-500" @click="resetDefaults">
        {{ t('reset-defaults', 'Standartga qaytarish') }}
      </Button>
    </div>
    <p class="text-xs text-gray-400 mb-4">{{ t('page-permissions-hint', 'Har bir rol qaysi sahifalarni ko\'ra olishini belgilang') }}</p>

    <div v-if="loading" class="py-10 flex justify-center">
      <Loader2Icon class="w-5 h-5 animate-spin text-gray-400" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs text-gray-500">
            <th class="px-3 py-2 text-left font-medium">{{ t('page', 'Sahifa') }}</th>
            <th v-for="r in roles" :key="r.level" class="px-3 py-2 text-center font-medium">{{ r.label }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in pages" :key="p.key" class="hover:bg-gray-50/60">
            <td class="px-3 py-2.5 text-gray-700">{{ p.label }}</td>
            <td v-for="r in roles" :key="r.level" class="px-3 py-2.5 text-center">
              <input
                type="checkbox"
                class="w-4 h-4 accent-[#f27a3a] cursor-pointer"
                :checked="matrix[p.key]?.[r.level]"
                @change="toggle(p.key, r.level)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-5 flex justify-end">
      <Button :disabled="saving || loading" @click="save" class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
        <Loader2Icon v-if="saving" class="w-4 h-4 mr-1 animate-spin" />{{ t('save', 'Saqlash') }}
      </Button>
    </div>
  </div>
</template>
