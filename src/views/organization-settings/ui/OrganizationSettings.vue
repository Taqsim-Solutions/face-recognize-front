<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useGetOrganization } from '../query/useGetOrganization'
import {
  OrganizationDetails,
  OrganizationWeekends,
  OrganizationSalary,
  OrganizationLocation,
  OrganizationLeaveOptions,
  TelegramSettings,
  IntegratorPendingChanges
} from '../modules'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrganizationQrCode from '../modules/OrganizationQrCode.vue'
import Organization1cKeys from '../modules/Organization1cKeys.vue'
import Cameras from '../modules/Cameras.vue'
import OrganizationDaysOff from '../modules/OrganizationDaysOff.vue'
import { useRoute, useRouter } from 'vue-router'
import Can from '@/components/can.vue'
import { computed } from 'vue'

const { t } = useI18n()
const { data } = useGetOrganization()
const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => (route.query.tab as string) || 'details',
  set: (val) => {
    router.push({ query: { ...route.query, tab: val } })
  }
})

const innerTab = computed({
  get: () => (route.query.innerTab as string) || 'keys',
  set: (val) => {
    router.push({ query: { ...route.query, innerTab: val } })
  }
})

const weekendsInnerTab = computed({
  get: () => (route.query.wTab as string) || 'weekends',
  set: (val) => {
    router.push({ query: { ...route.query, wTab: val } })
  }
})

const salaryInnerTab = computed({
  get: () => (route.query.sTab as string) || 'salary',
  set: (val) => {
    router.push({ query: { ...route.query, sTab: val } })
  }
})
</script>

<template>
  <header
    class="flex flex-col md:flex-row justify-between items-center md:items-center gap-3 border-b lg:pb-3 pb-6 px-6"
  >
    <div class="flex flex-col mt-1">
      <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
        {{ t('settings') }}
      </h2>
    </div>
  </header>
  <div class="mt-5 w-full">
    <Tabs v-model="activeTab" class="flex gap-2 flex-wrap">
      <TabsList class="flex-wrap w-full px-6">
        <Can i="organizations.modifier">
          <TabsTrigger value="details" class="text-sm font-medium">
            {{ t('organization details') }}
          </TabsTrigger>
        </Can>
        <Can i="organization.days.off.modifier">
          <TabsTrigger value="weekends" class="text-sm font-medium">
            {{ t('weekends') }}
          </TabsTrigger>
        </Can>
        <Can i="employee.salary.restrictions.modifier">
          <TabsTrigger value="salary" class="text-sm font-medium">
            {{ t('salary') }}
          </TabsTrigger>
        </Can>
        <Can i="organizations.modifier">
          <TabsTrigger value="location" class="text-sm font-medium">
            {{ t('location') }}
          </TabsTrigger>
        </Can>
        <Can i="organizations.modifier">
          <TabsTrigger value="qr-code" class="text-sm">
            {{ t('qr-code') }}
          </TabsTrigger>
        </Can>
        <Can i="organizations.modifier">
          <TabsTrigger value="1c" class="text-sm">
            {{ t('1C keys') }}
          </TabsTrigger>
        </Can>
        <Can i="organizations.modifier">
          <TabsTrigger value="cameras" class="text-sm">
            {{ t('Camera settings') }}
          </TabsTrigger>
        </Can>
        <Can i="organizations.modifier">
          <TabsTrigger value="telegram" class="text-sm">
            {{ t('telegram') }}
          </TabsTrigger>
        </Can>
      </TabsList>

      <div class="px-6 mt-2 w-full">
        <TabsContent value="details" class="w-full">
          <Can i="organizations.modifier">
            <OrganizationDetails v-if="data" :data="data.data.data" />
          </Can>
        </TabsContent>

        <TabsContent value="weekends" class="w-full">
          <div class="flex flex-col gap-6">
            <div class="inline-flex p-1 bg-gray-100/60 rounded-xl w-fit border border-gray-200/50 backdrop-blur-sm">
              <button
                @click="weekendsInnerTab = 'weekends'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  weekendsInnerTab === 'weekends'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('weekends') }}
              </button>
              <button
                @click="weekendsInnerTab = 'days-off'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  weekendsInnerTab === 'days-off'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('days-off') }}
              </button>
            </div>

            <div class="w-full">
              <Can i="organization.days.off.modifier">
                <div v-if="weekendsInnerTab === 'weekends'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <OrganizationWeekends />
                </div>
                <div v-if="weekendsInnerTab === 'days-off'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <OrganizationDaysOff />
                </div>
              </Can>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="salary" class="w-full">
          <div class="flex flex-col gap-6">
            <div class="inline-flex p-1 bg-gray-100/60 rounded-xl w-fit border border-gray-200/50 backdrop-blur-sm">
              <button
                @click="salaryInnerTab = 'salary'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  salaryInnerTab === 'salary'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('salary-and-advance') }}
              </button>
              <button
                @click="salaryInnerTab = 'leave'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  salaryInnerTab === 'leave'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('leave-options') }}
              </button>
            </div>

            <div class="w-full">
              <Can i="employee.salary.restrictions.modifier">
                <div v-if="salaryInnerTab === 'salary'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <OrganizationSalary />
                </div>
                <div v-if="salaryInnerTab === 'leave'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <OrganizationLeaveOptions />
                </div>
              </Can>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" class="w-full">
          <Can i="organizations.modifier">
            <OrganizationLocation />
          </Can>
        </TabsContent>

        <TabsContent value="qr-code" class="w-full">
          <Can i="organizations.modifier">
            <OrganizationQrCode />
          </Can>
        </TabsContent>

        <TabsContent value="1c" class="w-full">
          <div class="flex flex-col gap-6">
            <div class="inline-flex p-1 bg-gray-100/60 rounded-xl w-fit border border-gray-200/50 backdrop-blur-sm">
              <button
                @click="innerTab = 'keys'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  innerTab === 'keys'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('1C keys') }}
              </button>
              <button
                @click="innerTab = 'changes'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  innerTab === 'changes'
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                ]"
              >
                {{ t('Pending Changes') }}
              </button>
            </div>

            <div class="w-full">
              <Can i="organizations.modifier">
                <div v-if="innerTab === 'keys'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Organization1cKeys />
                </div>
                <div v-if="innerTab === 'changes'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <IntegratorPendingChanges />
                </div>
              </Can>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cameras" class="w-full">
          <Can i="organizations.modifier">
            <Cameras />
          </Can>
        </TabsContent>

        <TabsContent value="telegram" class="w-full">
          <Can i="organizations.modifier">
            <TelegramSettings />
          </Can>
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>
