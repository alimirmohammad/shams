<template>
  <header
    class="flex flex-row justify-between items-center bg-white border-b border-gray-100 px-8 pt-7 pb-3 min-h-[90px]"
  >
    <div class="min-w-[24px]">
      <slot name="startAction" />
    </div>
    <div>
      <slot>
        <h1 class="headline-3 text-gray-900">{{ title }}</h1>
      </slot>
    </div>
    <div class="min-w-[24px]">
      <slot name="endAction" />
    </div>
  </header>
</template>

<script setup lang="ts">
type Props = {
  title?: string;
};

defineProps<Props>();
</script>
