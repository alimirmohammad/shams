<template>
  <div class="tabs tabs-boxed bg-primary-50 w-max">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)"
      class="tab text-primary-900"
      :class="{
        'bg-white border-2 border-primary-600': modelValue === tab.value,
      }"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
type Tab = { label: string; value: string };

type Props = {
  tabs: Tab[];
  modelValue: string;
};

type Emits = {
  (e: 'update:modelValue', tab: string): void;
};

defineProps<Props>();
defineEmits<Emits>();
</script>
