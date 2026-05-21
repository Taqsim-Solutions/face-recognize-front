<script setup lang="ts">
import { ref } from 'vue'
import PhoneForm from './PhoneForm.vue'
import RecoveryForm from './RecoveryForm.vue'

const showRecoveryForm = ref(false)
const phoneNumber = ref('')
const requestId = ref('')

const handleOtpRequested = (phone: string, id: string) => {
  phoneNumber.value = phone
  requestId.value = id
  showRecoveryForm.value = true
}
</script>

<template>
  <div class="w-full">
    <PhoneForm v-if="!showRecoveryForm" @otp-requested="handleOtpRequested" />
    <RecoveryForm v-else :phone-number="phoneNumber" :request-id="requestId" />
  </div>
</template>
