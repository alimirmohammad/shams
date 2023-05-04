<template>
  <header
    class="flex flex-row justify-between items-center bg-[#F1F1F1] shadow px-8 pt-7 pb-3 min-h-[90px]"
  >
    <div class="min-w-[24px]">
      <slot name="startAction" />
    </div>
    <div>
      <h1 class="headline-3 text-gray-900">{{ title }}</h1>
    </div>
    <div class="min-w-[24px]">
      <slot name="endAction" />
    </div>
  </header>
</template>

<script setup lang="ts">
type Props = {
  title: string;
};

defineProps<Props>();
</script>
