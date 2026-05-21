<script setup lang="ts">
import type { NotificationTemplate } from '../../types'
import EditNotificationTemplateDialog from './EditNotificationTemplateDialog.vue'
import { Switch } from '@/components/ui/switch'
import { useUpdateNotificationTemplateState } from '../../query'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import Can from '@/components/can.vue'

const props = defineProps<{
  template: NotificationTemplate
}>()

const { t } = useI18n()
const { mutate: updateState } = useUpdateNotificationTemplateState()

const handleStateChange = (checked: boolean) => {
  const newState = checked ? 'active' : 'disabled'
  updateState(
    { id: props.template.id, state: newState },
    {
      onSuccess: () => {
        toast.success(t('notification-template-state-updated'))
      },
      onError: () => {
        toast.error(t('error-occurred'))
      }
    }
  )
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Can i="notifications.modifier">
      <EditNotificationTemplateDialog :template="template" />
    </Can>
    
    <div class="flex items-center space-x-2">
      <Can i="notifications.modifier">
        <Switch 
            :checked="template.state === 'active'" 
            @update:checked="handleStateChange"
        />
      </Can>
    </div>
  </div>
</template>
