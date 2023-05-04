<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.8889 13H3.11111C2.5037 13 2 12.5467 2 12C2 11.4533 2.5037 11 3.11111 11H20.8889C21.4963 11 22 11.4533 22 12C22 12.5467 21.4963 13 20.8889 13Z"
      :fill="white ? '#FFFFFF' : '#6972F1'"
    />
    <path
      d="M12 22C11.4533 22 11 21.4963 11 20.8889V3.11111C11 2.5037 11.4533 2 12 2C12.5467 2 13 2.5037 13 3.11111V20.8889C13 21.4963 12.5467 22 12 22Z"
      :fill="white ? '#FFFFFF' : '#6972F1'"
    />
  </svg>
</template>

<script setup lang="ts">
type Props = {
  white?: boolean;
};

defineProps<Props>();
</script>
