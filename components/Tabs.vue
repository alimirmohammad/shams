<template>
  <div class="tabs tabs-boxed bg-primary-50 w-max">
    <div
      v-for="tab in tabs"
      :key="tab.to"
      class="tab text-primary-900 px-11 headline-3"
      :class="{
        'bg-white border-2 border-primary-500': activeTab === tab.to,
      }"
    >
      <NuxtLink :to="tab.to">
        {{ tab.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
type Tab = { label: string; to: string };

type Props = {
  tabs: Tab[];
  activeTab: string;
};

defineProps<Props>();
</script>
