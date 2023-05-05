<template>
  <div
    class="calc-width absolute"
    :class="hasBottomSheet ? 'bottom-20' : 'bottom-6'"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
type Props = {
  hasBottomSheet?: boolean;
};

defineProps<Props>();
</script>

<style scoped>
.calc-width {
  width: calc(100% - 2rem);
}
</style>
