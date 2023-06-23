<template>
  <div class="page">
    <Header :title="data?.title ?? 'گزارش'">
      <div
        v-if="isLoading"
        class="flex items-center justify-center w-full h-full bg-white"
      >
        <LoadingRipple />
      </div>
      <template #startAction>
        <IconButton @click="navigateTo('/reports')">
          <ArrowRightIcon />
        </IconButton>
      </template>
    </Header>
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <main v-else class="bg-white overflow-auto shadow-xl p-4 pt-8">
      <p class="body-1 text-gray-900 whitespace-pre-wrap">
        {{ data?.description }}
      </p>
    </main>
    <ToastError :error="error" :is-error="isError" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const route = useRoute();
const id = computed(() => route.params.id);

const { data, error, isError, isLoading } = useQuery({
  queryKey: ['reports', id],
  queryFn: () => $fetch(`/api/reports/${id.value}`),
});
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
