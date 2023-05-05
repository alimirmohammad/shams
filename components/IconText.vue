<template>
  <button class="flex flex-col items-center gap-2">
    <slot />
    <p :class="['body-3', neutral ? 'text-gray-300' : 'text-primary-500']">
      {{ title }}
    </p>
  </button>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  neutral?: boolean;
};

defineProps<Props>();
</script>
