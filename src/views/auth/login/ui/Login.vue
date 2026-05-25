<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoginForm from '../modules/LoginForm.vue'
import logo from '@/assets/logo.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LanguagesIcon, CheckIcon } from 'lucide-vue-next'

const { t, locale } = useI18n()

const handleLangChange = (v: string) => {
  locale.value = v
  localStorage.setItem('language', v)
}

const languages = [
  { code: 'uz', label: 'Uzbek tili' },
  { code: 'uzc', label: 'Узбек тили' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'fa', label: 'دری' },
  { code: 'ps', label: 'پښتو' },
  { code: 'ur', label: 'اردو' }
]
</script>

<template>
  <div class="w-full px-8">
    <!-- Language switcher top-right -->
    <div class="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          class="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all cursor-pointer shadow-sm"
        >
          <LanguagesIcon :size="16" />
          <span>{{ t('language') }}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-44 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
          <DropdownMenuItem
            v-for="lang in languages"
            :key="lang.code"
            @click="handleLangChange(lang.code)"
            class="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <span>{{ lang.label }}</span>
            <CheckIcon v-show="locale === lang.code" :size="14" class="text-[#ff792d]" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex items-center justify-center h-full">
      <div>
        <div>
          <img :src="logo" alt="Taqsim Oylik" class="w-14" />
          <h2
            class="text-foreground mt-8 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
          >
            {{ t('auth.sign-in-label') }}
          </h2>
          <p class="mt-1 text-base text-grayx1">
            {{ t('auth.sign-in-desc') }}
          </p>
        </div>

        <div class="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
