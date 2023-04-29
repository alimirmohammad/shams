<template>
  <div
    class="flex flex-row items-center justify-between label-2 border-2 border-primary-600 bg-primary-50 text-primary-700 p-3 rounded-lg"
    :class="{ 'bg-primary-600 text-white': Boolean(debt) }"
  >
    <span>{{ name }} ({{ numOfSharesPersian }})</span>
    <span v-if="debt">{{ debtPersian }}</span>
    <ArrowLeftIcon :white="Boolean(debt)" />
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
