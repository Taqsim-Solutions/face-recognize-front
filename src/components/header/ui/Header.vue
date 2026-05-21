<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import { PanelLeftIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

const { t } = useI18n()
const sidebarState = useStorage('sidebar', 'expanded')

const handleSidebarState = () => {
  if (sidebarState.value === 'expanded') {
    sidebarState.value = 'collapsed'
  } else {
    sidebarState.value = 'expanded'
  }
}
</script>

<template>
  <div
    class="sticky top-0 border-b h-16 flex items-center justify-between bg-white px-3 z-10 lg:hidden"
  >
    <div class="flex items-center gap-3">
      <TooltipProvider :delayDuration="0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" @click="handleSidebarState">
              <PanelLeftIcon :size="18" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>{{ t('open-close-sidebar') }}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
