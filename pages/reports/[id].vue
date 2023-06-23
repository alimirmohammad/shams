<template>
  <div class="page">
    <Header :title="data?.title ?? 'گزارش'">
      <template #startAction>
        <IconButton @click="navigateTo('/reports')">
          <ArrowRightIcon />
        </IconButton>
      </template>
    </Header>
    <main class="bg-white overflow-auto shadow-xl p-4 pt-8">
      <p class="body-1 text-gray-900 whitespace-pre-wrap">
        {{ data?.description }}
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const route = useRoute();
const id = computed(() => route.params.id);

const { data } = useQuery({
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
