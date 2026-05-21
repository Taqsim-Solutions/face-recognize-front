<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useGetTerminalById } from '../query/useGetTerminalById'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServerError from '@/components/error/ServerError.vue'
import DepositsList from './components/DepositsList.vue'
import BalanceManagement from './components/BalanceManagement.vue'
import { LayoutDashboard, FileText, Settings, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const terminalId = computed(() => {
  const id = route.params.id as string
  return id ? parseInt(id) : undefined
})

const organizationId = computed(() => {
  return route.params.orgId as string
})

const { data, isLoading, isError } = useGetTerminalById(terminalId)
const terminal = computed(() => data.value?.data)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

const activeTab = computed({
  get: () => (route.query.tab as string) || 'overview',
  set: (val) => {
    const query = { ...route.query }
    if (val === 'overview') {
      delete query.tab
    } else {
      query.tab = val
    }
    router.replace({ query })
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br">
    <!-- Header -->
    <div class="border-b border-gray-300/60 pb-3 px-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            @click="router.push({ name: 'payments-list' })"
            class="text-[#596881] transition-colors border h-9 w-9 opacity-100 rounded-xl border-[#E0E6F0]"
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
          <div class="flex gap-3 items-center">
            <RouterLink to="/payments">
              <p v-if="terminal" class="text-lg font-bold text-[#8796AF] bg-clip-text">
                {{ t('payments') }}
              </p></RouterLink
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
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
              v-if="terminal"
              class="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            >
              {{ terminal.name || terminal.terminalId }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="py-6 px-6">
      <template v-if="isError">
        <ServerError />
      </template>

      <template v-else-if="isLoading">
        <div class="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 class="w-10 h-10 animate-spin text-blue-600" />
          <p class="text-gray-500 animate-pulse">{{ t('loading') }}</p>
        </div>
      </template>

      <template v-else-if="terminal">
        <!-- Tabbed Content -->
        <Tabs :model-value="activeTab" @update:model-value="(v) => (activeTab = v as string)" class="w-full">
          <div class="flex justify-center">
            <TabsList
              class="inline-flex bg-gray-100 rounded-xl p-1.5 lg:w-1/2 mx-auto border-none lg:gap-auto gap-3 justify-center !w-auto"
            >
              <TabsTrigger
                value="overview"
                class="h-10 after:hidden pb-0 rounded-lg px-5 text-base font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                <LayoutDashboard class="w-5 h-5 inline-block mr-1.5 -mt-1" />
                {{ t('overview') }}
              </TabsTrigger>
              <Can i="payment.terminal.deposits">
                <TabsTrigger
                  value="deposits"
                  class="h-10 rounded-lg after:hidden pb-0 text-base px-6 font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <FileText class="w-5 h-5 inline-block mr-1.5 -mt-1" />
                  {{ t('deposits') }}
                </TabsTrigger>
              </Can>
              <Can i="payment.terminal.organizations.modifier">
                <TabsTrigger
                  value="balance-management"
                  class="h-10 rounded-lg text-base after:hidden px-5 pb-0 font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <Settings class="w-5 h-5 inline-block mr-1.5 -mt-1" />
                  {{ t('balance-management') }}
                </TabsTrigger>
              </Can>
            </TabsList>
          </div>

          <TabsContent value="overview" class="mt-8">
            <!-- Financial Overview -->
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card
                class="relative border border-[#E0E6F0] overflow-hidden rounded-2xl bg-white shadow-sm items-center flex p-5"
              >
                <div
                  class="absolute top-0 right-0 w-40 h-24 bg-gradient-to-br from-[#33B586]/40 to-[#33B586]/70 rounded-full blur-3xl translate-x-10 -translate-y-10 pointer-events-none"
                />

                <div class="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="56"
                    viewBox="0 0 46 46"
                    fill="none"
                  >
                    <rect width="46" height="46" rx="10" fill="#EBF9F4" />
                    <path
                      d="M25.8 20C25.6188 19.6858 25.3557 19.4267 25.0386 19.2506C24.7215 19.0744 24.3625 18.9878 24 19H22C21.4696 19 20.9609 19.2107 20.5858 19.5858C20.2107 19.9609 20 20.4696 20 21C20 21.5304 20.2107 22.0391 20.5858 22.4142C20.9609 22.7893 21.4696 23 22 23H24C24.5304 23 25.0391 23.2107 25.4142 23.5858C25.7893 23.9609 26 24.4696 26 25C26 25.5304 25.7893 26.0391 25.4142 26.4142C25.0391 26.7893 24.5304 27 24 27H22C21.6375 27.0122 21.2785 26.9256 20.9614 26.7495C20.6443 26.5733 20.3812 26.3142 20.2 26M23 18V28M14 23C14 24.1819 14.2328 25.3522 14.6851 26.4442C15.1374 27.5361 15.8003 28.5282 16.636 29.364C17.4718 30.1997 18.4639 30.8626 19.5558 31.3149C20.6478 31.7672 21.8181 32 23 32C24.1819 32 25.3522 31.7672 26.4442 31.3149C27.5361 30.8626 28.5282 30.1997 29.364 29.364C30.1997 28.5282 30.8626 27.5361 31.3149 26.4442C31.7672 25.3522 32 24.1819 32 23C32 21.8181 31.7672 20.6478 31.3149 19.5558C30.8626 18.4639 30.1997 17.4718 29.364 16.636C28.5282 15.8003 27.5361 15.1374 26.4442 14.6851C25.3522 14.2328 24.1819 14 23 14C21.8181 14 20.6478 14.2328 19.5558 14.6851C18.4639 15.1374 17.4718 15.8003 16.636 16.636C15.8003 17.4718 15.1374 18.4639 14.6851 19.5558C14.2328 20.6478 14 21.8181 14 23Z"
                      stroke="#33B586"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div class="relative z-10">
                    <div class="text-2xl font-bold text-gray-900 tracking-tight">
                      {{ terminal?.balance?.toLocaleString() }} {{ t('currency') }}
                    </div>
                    <p class="text-[#596881]">
                      {{ t('current-balance') }}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                class="relative border border-[#E0E6F0] overflow-hidden rounded-2xl bg-white shadow-sm items-center flex p-5"
              >
                <div
                  class="absolute top-0 right-0 w-40 h-24 bg-gradient-to-br from-[#2363DA]/20 to-[#2363DA]/40 rounded-full blur-3xl translate-x-10 -translate-y-10 pointer-events-none"
                />

                <div class="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="56"
                    viewBox="0 0 46 46"
                    fill="none"
                  >
                    <rect width="46" height="46" rx="10" fill="#E9F0FE" />
                    <path
                      d="M28 19V16C28 15.7348 27.8946 15.4804 27.7071 15.2929C27.5196 15.1054 27.2652 15 27 15H17C16.4696 15 15.9609 15.2107 15.5858 15.5858C15.2107 15.9609 15 16.4696 15 17M15 17C15 17.5304 15.2107 18.0391 15.5858 18.4142C15.9609 18.7893 16.4696 19 17 19H29C29.2652 19 29.5196 19.1054 29.7071 19.2929C29.8946 19.4804 30 19.7348 30 20V23M15 17V29C15 29.5304 15.2107 30.0391 15.5858 30.4142C15.9609 30.7893 16.4696 31 17 31H29C29.2652 31 29.5196 30.8946 29.7071 30.7071C29.8946 30.5196 30 30.2652 30 30V27M31 23V27H27C26.4696 27 25.9609 26.7893 25.5858 26.4142C25.2107 26.0391 25 25.5304 25 25C25 24.4696 25.2107 23.9609 25.5858 23.5858C25.9609 23.2107 26.4696 23 27 23H31Z"
                      stroke="#2363DA"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div class="relative z-10">
                    <div class="text-2xl font-bold text-gray-900 tracking-tight">
                      {{ terminal?.credit?.toLocaleString() }} {{ t('currency') }}
                    </div>
                    <p class="text-[#596881]">
                      {{ t('total-credit') }}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                class="relative border border-[#E0E6F0] overflow-hidden rounded-2xl bg-white shadow-sm items-center flex p-5"
              >
                <div
                  class="absolute top-0 right-0 w-40 h-24 bg-gradient-to-br from-[#CB193B]/20 to-[#CB193B]/40 rounded-full blur-3xl translate-x-10 -translate-y-10 pointer-events-none"
                />

                <div class="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="56"
                    viewBox="0 0 46 46"
                    fill="none"
                  >
                    <rect width="46" height="46" rx="10" fill="#FCE8EC" />
                    <path
                      d="M29 23H29.01M17 23H17.01M20 23C20 23.7956 20.3161 24.5587 20.8787 25.1213C21.4413 25.6839 22.2044 26 23 26C23.7956 26 24.5587 25.6839 25.1213 25.1213C25.6839 24.5587 26 23.7956 26 23C26 22.2044 25.6839 21.4413 25.1213 20.8787C24.5587 20.3161 23.7956 20 23 20C22.2044 20 21.4413 20.3161 20.8787 20.8787C20.3161 21.4413 20 22.2044 20 23ZM14 19C14 18.4696 14.2107 17.9609 14.5858 17.5858C14.9609 17.2107 15.4696 17 16 17H30C30.5304 17 31.0391 17.2107 31.4142 17.5858C31.7893 17.9609 32 18.4696 32 19V27C32 27.5304 31.7893 28.0391 31.4142 28.4142C31.0391 28.7893 30.5304 29 30 29H16C15.4696 29 14.9609 28.7893 14.5858 28.4142C14.2107 28.0391 14 27.5304 14 27V19Z"
                      stroke="#CB193B"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div class="relative z-10">
                    <div class="text-2xl font-bold text-gray-900 tracking-tight">
                      {{ terminal?.debit?.toLocaleString() }} {{ t('currency') }}
                    </div>
                    <p class="text-[#596881]">
                      {{ t('total-debit') }}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <Card class="rounded-2xl border border-gray-200 bg-white shadow-none">
              <CardHeader class="border-b pt-7 mb-6 text-lg">
                <CardTitle>{{ t('terminal-overview') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-1 gap-5">
                  <div class="grid lg:grid-cols-3 grid-cols-2">
                    <p class="font-medium text-gray-500">{{ t('terminal-id') }}</p>
                    <p class="font-semibold">{{ terminal.terminalId }}</p>
                  </div>
                  <div class="grid lg:grid-cols-3 grid-cols-2">
                    <p class="font-medium text-gray-500">{{ t('merchant-id') }}</p>
                    <p class="font-semibold">{{ terminal.merchantId }}</p>
                  </div>
                  <div class="grid lg:grid-cols-3 grid-cols-2">
                    <p class="font-medium text-gray-500">{{ t('created-at') }}</p>
                    <p class="font-semibold">{{ formatDate(terminal.createdAt) }}</p>
                  </div>
                  <div class="grid lg:grid-cols-3 grid-cols-2">
                    <p class="font-medium text-gray-500">{{ t('comment') }}</p>
                    <p class="font-semibold">{{ terminal.comment }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <Can i="payment.terminal.deposits">
            <TabsContent value="deposits" class="mt-6">
              <DepositsList :epos-terminal-id="terminalId!" />
            </TabsContent>
          </Can>

          <Can i="payment.terminal.organizations.modifier">
            <TabsContent value="balance-management" class="mt-6">
              <BalanceManagement
                :epos-terminal-id="terminalId!"
                :org-id="organizationId"
                :terminal-balance="terminal.balance"
              />
            </TabsContent>
          </Can>
        </Tabs>
      </template>
    </div>
  </div>
</template>
