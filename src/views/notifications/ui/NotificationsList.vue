<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotificationsTemplates from './NotificationsTemplates.vue'
import NotificationsDashboard from './NotificationsDashboard.vue'

const { t } = useI18n()
</script>

<template>
  <header
    class="flex flex-col md:flex-row justify-between items-center md:items-center gap-3 border-b pb-4 px-5"
  >
    <div class="flex flex-col mt-1">
      <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
        {{ t('notifications') }}
      </h2>
    </div>
  </header>

  <div class="mt-4 w-full px-0">
    <Tabs defaultValue="dashboard" class="w-full">
      <div class="px-6 mb-2">
        <TabsList >
          <TabsTrigger value="dashboard">{{ t('dashboard') }}</TabsTrigger>
          <TabsTrigger value="templates">{{ t('notification-templates') }}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="dashboard" class="mt-0">
        <NotificationsDashboard />
      </TabsContent>
      <TabsContent value="templates" class="mt-0">
        <NotificationsTemplates />
      </TabsContent>
    </Tabs>
  </div>
</template>
