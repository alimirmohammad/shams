<template>
  <button
    type="submit"
    class="btn btn-primary flex flex-row items-center justify-center gap-2"
    :class="{
      'label-1': !sm,
      'label-3': sm,
      'btn-outline': outline,
      'btn-block': block,
    }"
  >
    <slot />
    <slot name="icon" />
  </button>
</template>

<script setup lang="ts">
type Props = {
  block?: boolean;
  outline?: boolean;
  sm?: boolean;
};

defineProps<Props>();
</script>

<style scoped></style>
