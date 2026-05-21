<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const location = route.name;

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="error-container">
    <h1>500</h1>
    <span>Something went wrong.</span>
    <Button v-if="location !== 'home'" @click="goHome">Home Page</Button>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 400px);
}

h1 {
  font-size: 4.5rem;
  font-weight: 500;
  /* margin-bottom: 1rem; */
}

span {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
