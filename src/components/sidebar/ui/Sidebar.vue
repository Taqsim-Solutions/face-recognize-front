<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useGetAccountOrgs } from '@/views/account/detail/queries/useGetAccountOrgs'
import { useGetAccountInfo } from '@/views/account/detail/queries/useGetAccountInfo'
import { getOrganizationImg } from '@/views/organization-settings/api'
import { getAccountImg } from '@/views/account/detail/api'
import { clearLoginToken } from '@/lib/utils'
import { useStorage } from '@vueuse/core'
import { usePermissions } from '@/api/usePermissions'
import { onMounted, onUnmounted } from 'vue'

import { Button } from '@/components/ui/button'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Loader2Icon,
  CheckIcon,
  UserRoundIcon,
  SettingsIcon,
  LanguagesIcon,
  LogOutIcon,
  Building2Icon
} from 'lucide-vue-next'
import { links } from './links'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const { data: permissions, isLoading: isPermissionsLoading } = usePermissions()
const { data: orgsList, isLoading } = useGetAccountOrgs()
const sidebarState = useStorage('sidebar', 'expanded')

const currentOrg = computed(() => {
  if (!orgsList.value) return null
  const selectedOrgId = localStorage.getItem('organizationId')
  return (
    orgsList.value.find((org: any) => org.organization?.id?.toString() === selectedOrgId)
      ?.organization || orgsList.value[0]?.organization
  )
})

const orgImgId = computed(() => {
  if (currentOrg.value) {
    return currentOrg.value.images?.find(
      (img: { type: 'avatar' | 'cover'; id: string }) => img.type === 'avatar'
    )?.id
  }
  return ''
})

const enabled = computed(() => !!currentOrg.value && !!orgImgId.value)

const { data: orgImage, error: imageError } = useQuery({
  queryKey: ['organization-img', orgImgId],
  queryFn: () => getOrganizationImg(orgImgId.value),
  enabled
})

const orgImageSrc = ref<string>()
watch(orgImage, (blob) => (orgImageSrc.value = URL.createObjectURL(blob?.data)))

const { data: account, isLoading: accountLoading } = useGetAccountInfo()
const accountImgId = computed(() => account.value?.images.find((i: any) => i.type === 'avatar')?.id)
const isAccountImgEnabled = computed(() => !!accountImgId.value)

const { data: accountImg } = useQuery({
  queryKey: ['account-img', accountImgId],
  queryFn: () => getAccountImg(accountImgId.value),
  enabled: isAccountImgEnabled
})

const accountImageSrc = ref<string>('/avatar.png')
watch(accountImg, (blob) => {
  accountImageSrc.value = blob?.data ? URL.createObjectURL(blob.data) : '/avatar.png'
})

const onAccountImgError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = '/avatar.png'
}

const hasPermission = (permission: string) => {
  return permissions.value?.permissions?.some((p: any) => p.name === permission) ?? false
}

// Filter links based on the permission defined in the route meta
const filteredLinks = computed(() => {
  return links.filter((link) => {
    const resolvedRoute = router.resolve({ name: link.location })
    const requiredPermission = resolvedRoute.meta?.permission as string | undefined
    return !requiredPermission || hasPermission(requiredPermission)
  })
})

const handleLangChange = (v: 'uz' | 'uzc' | 'ru') => {
  locale.value = v
  localStorage.setItem('language', v)
  queryClient.invalidateQueries()
}

const handleLogout = () => {
  clearLoginToken()
  localStorage.removeItem('user_permissions')
  router.push({ name: 'login' })
}

const handleOrganizationSwitch = async (orgId: string) => {
  // Save the new organization ID to localStorage
  localStorage.setItem('organizationId', orgId)

  // Redirect to dashboard and replace the current history entry to prevent 
  // users from going back to the previous organization's data/panels.
  window.location.replace('/')
}

const collapseSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    sidebarState.value = 'collapsed'
  } else {
    sidebarState.value = 'expanded'
  }
}

onMounted(() => {
  const handleResize = () => collapseSidebarOnMobile()
  window.addEventListener('resize', handleResize)
  collapseSidebarOnMobile() // run once on mount
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})
</script>

<template>
  <TooltipProvider>
    <aside
      v-bind="$attrs"
      class="fixed lg:sticky top-0 z-40 border-r grid grid-rows-[64px_1fr_64px] h-screen bg-[#F7F9FB] transition-all duration-300 ease-in-out border-[#E0E6F0]"
      :class="[
        sidebarState === 'collapsed' ? '-left-full lg:left-0 w-16' : 'left-0 w-64',
        'lg:relative'
      ]"
    >
      <!-- Header -->
      <header
        class="bg-[#F7F9FB] sticky top-1"
        :class="{
          'w-[47px] flex items-center justify-center': sidebarState === 'collapsed',
          'w-[255px] h-16 pb-3 px-2 pt-2': sidebarState === 'expanded'
        }"
      >
        <Button
          variant="ghost"
          size="icon"
          class="lg:hidden absolute top-0 -right-9 z-50 bg-[rgba(0,0,0,0.08)]"
          @click="sidebarState = 'collapsed'"
        >
          <span class="sr-only">Close sidebar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
        <Popover>
          <PopoverTrigger
            v-if="sidebarState === 'expanded'"
            class="flex justify-between w-full h-15 items-center rounded-lg bg-white p-2.5 border border-[#E0E6F0] select-none cursor-pointer"
          >
            <Loader2Icon v-if="isLoading" class="animate-spin bg-muted" />
            <div v-else-if="!isLoading || orgImageSrc" class="flex items-center gap-x-2">
              <div
                v-if="imageError || !orgImageSrc"
                class="border rounded bg-muted flex items-center justify-center w-7 h-7 mt-0.5"
              >
                <Building2Icon :size="18" />
              </div>
              <img
                v-if="orgImageSrc"
                :src="orgImageSrc"
                alt="Organization logo"
                class="w-10 h-10 rounded-lg object-cover border mt-[1px]"
              />
              <div style="line-height: 0.6; text-align: left">
                <span class="text-sm font-bold">{{ currentOrg?.name }}</span> <br />
                <span class="text-xs ml-[1px]">{{ t('Current project') }}</span>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M4.5 6.75L9 11.25L13.5 6.75"
                stroke="#8796AF"
                strokeWidth="1.92857"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </PopoverTrigger>

          <PopoverTrigger
            v-else
            class="w-9 h-9 hover:bg-muted rounded flex items-center justify-center ml-4"
          >
            <Loader2Icon v-if="isLoading" class="animate-spin bg-muted" />
            <div v-else>
              <div
                v-if="imageError"
                class="border rounded bg-muted flex items-center justify-center w-7 h-7"
              >
                <Building2Icon :size="18" />
              </div>
              <img v-else :src="orgImageSrc" alt="Organization logo" class="w-7 h-7 rounded" />
            </div>
          </PopoverTrigger>

          <PopoverContent class="py-2 px-2 w-60">
            <ul>
              <li v-for="org in orgsList" :key="org.organization.id">
                <Button
                  variant="ghost"
                  class="w-full justify-between"
                  @click="handleOrganizationSwitch(org.organization.id)"
                >
                  {{ org.organization.name }}
                  <CheckIcon v-if="org.organization.id === currentOrg?.id" :size="16" />
                </Button>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </header>

      <!-- Links -->
      <nav class="space-y-1 p-2 mt-4">
        <!-- Premium skeleton loading state matching the active state of sidebar -->
        <ul v-if="isPermissionsLoading" class="space-y-3 px-1">
          <li v-for="i in 5" :key="i" class="flex items-center gap-x-3 rounded-lg px-3 py-2.5 animate-pulse">
            <div class="w-[22px] h-[22px] rounded bg-[#E0E6F0]"></div>
            <div v-show="sidebarState === 'expanded'" class="h-4 rounded bg-[#E0E6F0] flex-1 max-w-[130px]" :style="{ width: ['50%', '75%', '60%', '70%', '55%'][i - 1] }"></div>
          </li>
        </ul>
        
        <ul v-else class="space-y-1">
          <li v-for="link in filteredLinks" :key="link.name">
            <Tooltip v-if="sidebarState === 'collapsed'" :delay-duration="0">
              <TooltipTrigger asChild>
                <RouterLink :to="{ name: link.location }" @click="collapseSidebarOnMobile()">
                  <div
                    class="flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    :class="{
                      'bg-[#EFF3F8] text-accent-foreground border border-[#E0E6F0]':
                        route.name === link.location
                    }"
                  >
                    <component :is="link.icon" :size="22" />
                  </div>
                </RouterLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                {{ t(link.name) }}
              </TooltipContent>
            </Tooltip>

            <RouterLink v-else :to="{ name: link.location }" @click="collapseSidebarOnMobile()">
              <div
                class="flex items-center border transition-all border-[transparent] gap-x-3 rounded-lg px-3 py-2 text-sm text-[#596881] font-medium hover:bg-accent hover:text-accent-foreground"
                :class="{
                  'bg-[#EFF3F8] border !border-[#E0E6F0] text-accent-foreground !text-black':
                    route.name === link.location
                }"
              >
                <component :is="link.icon" :size="22" />
                <span v-show="sidebarState === 'expanded'">{{ t(link.name) }}</span>
              </div>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Footer / User -->
      <footer
        class="bg-[#F7F9FB] flex items-center px-3 pb-3"
        :class="{
          'w-[47px] justify-center': sidebarState === 'collapsed',
          'justify-between': sidebarState === 'expanded'
        }"
      >
        <Button v-if="accountLoading" disabled variant="ghost" class="w-full">
          <Loader2Icon class="animate-spin" />
        </Button>
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child v-if="sidebarState === 'expanded'">
            <Button
              variant="ghost"
              class="flex justify-between w-full h-14 bg-white px-2.5 border border-[#E0E6F0] select-none cursor-pointer"
            >
              <div class="flex items-center gap-x-2">
                <img
                  :src="accountImageSrc"
                  alt="User avatar"
                  class="rounded-full w-8 h-8"
                  @error="onAccountImgError"
                />
                <div class="flex-col text-start">
                  <p class="text-xs truncate max-w-[150px] mt-[1px] block">
                    {{ account.firstName }} {{ account.lastName }}
                  </p>
                  <p class="text-foreground/50 text-xs capitalize">
                    {{ account.roles?.[0] }}
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M4.5 6.75L9 11.25L13.5 6.75"
                  stroke="#8796AF"
                  strokeWidth="1.92857"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuTrigger
            v-else
            class="w-9 h-9 flex items-center justify-center rounded hover:bg-muted cursor-pointer"
          >
            <img
              :src="accountImageSrc"
              alt="User avatar"
              class="rounded w-7 h-7"
              @error="onAccountImgError"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <div class="flex items-center gap-x-2 px-1 py-2">
              <img
                v-if="accountImageSrc"
                :src="accountImageSrc"
                alt="User avatar"
                class="w-9 h-9 rounded"
              />
              <div class="flex-col text-start">
                <p class="text-sm truncate max-w-[150px]">
                  {{ account.firstName }} {{ account.lastName }}
                </p>
                <p class="text-foreground/50 text-sm capitalize">{{ account.roles?.[0] }}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Can i="users.detail">
                <RouterLink
                  class="contents"
                  :to="{ name: 'account-settings' }"
                  @click="collapseSidebarOnMobile()"
                >
                  <DropdownMenuItem>
                    <UserRoundIcon class="mr-2" :size="16" />
                    <span>{{ t('my-account') }}</span>
                  </DropdownMenuItem>
                </RouterLink>
              </Can>
              <Can i="organizations.modifier">
                <RouterLink
                  class="contents"
                  :to="{ name: 'organization-settings' }"
                  @click="collapseSidebarOnMobile()"
                >
                  <DropdownMenuItem>
                    <SettingsIcon class="mr-2" :size="16" />
                    <span>{{ t('organization') }}</span>
                  </DropdownMenuItem>
                </RouterLink>
              </Can>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LanguagesIcon class="mr-2" :size="16" />
                  <span>{{ t('language') }}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem @click="handleLangChange('uz')">
                      <span>Uzbek tili</span>
                      <CheckIcon v-show="locale === 'uz'" :size="16" />
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleLangChange('uzc')">
                      <span>Узбек тили</span>
                      <CheckIcon v-show="locale === 'uzc'" :size="16" />
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleLangChange('ru')">
                      <span>Русский</span>
                      <CheckIcon v-show="locale === 'ru'" :size="16" />
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout">
              <LogOutIcon class="mr-2" :size="16" />
              <span>{{ t('log-out') }}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </aside>
  </TooltipProvider>
</template>
