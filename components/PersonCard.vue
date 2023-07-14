<template>
  <div
    class="flex flex-row items-center justify-between label-2 border-2 border-primary-600 bg-primary-50 text-primary-700 p-3 rounded-lg"
    :class="{ 'bg-primary-600 text-white': Boolean(debt) }"
  >
    <span>{{ name }} ({{ numOfSharesPersian }})</span>
    <div class="flex items-center gap-8">
      <span v-if="debt">{{ debtPersian }}</span>
      <ArrowLeftIcon :white="Boolean(debt)" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  numOfShares: number;
  debt?: number;
};

const props = defineProps<Props>();

const numOfSharesPersian = computed(() =>
  convertToPersianDigit(props.numOfShares)
);
const debtPersian = computed(() =>
  props.debt ? convertToPersianDigit(props.debt) : ''
);
</script>
