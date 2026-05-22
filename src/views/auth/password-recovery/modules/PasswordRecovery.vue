<script setup lang="ts">
import { ref } from 'vue'
import PhoneForm from './PhoneForm.vue'
import RecoveryForm from './RecoveryForm.vue'

const showRecoveryForm = ref(false)
const phoneNumber = ref('')

const handleOtpRequested = (phone: string) => {
  phoneNumber.value = phone
  showRecoveryForm.value = true
}
</script>

<template>
  <div class="w-full">
    <PhoneForm v-if="!showRecoveryForm" @otp-requested="handleOtpRequested" />
    <RecoveryForm v-else :phone-number="phoneNumber" />
  </div>
</template>
