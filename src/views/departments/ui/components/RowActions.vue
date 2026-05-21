<script setup lang="ts">
import type { Department } from '../../types'
import EditDepartmentDialog from './EditDepartmentDialog.vue'
import DeleteDepartmentDialog from './DeleteDepartmentDialog.vue'
import Can from '@/components/can.vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

defineProps<{
  department: Department
}>()

const router = useRouter()
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
        variant="outline"
        @click.stop="router.push({ name: 'departments-detail', params: { id: department.id } })"
        class="bg-[#E9F0FE] hover:bg-[#E9F0FE] hover:opacity-80 transition-all border-none px-1.5 h-7"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M7.5 9C7.5 9.39782 7.65804 9.77936 7.93934 10.0607C8.22064 10.342 8.60218 10.5 9 10.5C9.39782 10.5 9.77936 10.342 10.0607 10.0607C10.342 9.77936 10.5 9.39782 10.5 9C10.5 8.60218 10.342 8.22064 10.0607 7.93934C9.77936 7.65804 9.39782 7.5 9 7.5C8.60218 7.5 8.22064 7.65804 7.93934 7.93934C7.65804 8.22064 7.5 8.60218 7.5 9Z"
            stroke="#266DF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.75 9C13.95 12 11.7 13.5 9 13.5C6.3 13.5 4.05 12 2.25 9C4.05 6 6.3 4.5 9 4.5C11.7 4.5 13.95 6 15.75 9Z"
            stroke="#266DF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    <Can i="departments.modifier">
      <EditDepartmentDialog :department="department" />
    </Can>
    <Can i="departments.modifier">
      <DeleteDepartmentDialog :id="department.id" />
    </Can>
  </div>
</template>
