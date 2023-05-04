<template>
  <div class="flex flex-row items-center justify-center gap-4">
    <span :class="{ 'body-1 text-black': lg, 'body-3 text-gray-900': !lg }">
      {{ title }}
    </span>
    <div
      class="flex flex-row items-center justify-center gap-2 p-2 bg-primary-50 rounded-md"
    >
      <span class="text-gray-900" :class="{ 'body-1': lg, 'body-3': !lg }">
        {{ total }}
      </span>
      <span class="text-gray-500" :class="{ 'body-2': lg, 'body-3': !lg }">
        ریال
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  price: number;
  lg?: boolean;
};

const props = defineProps<Props>();
const total = computed(() => convertToPersianDigit(props.price));
</script>

<style scoped></style>
