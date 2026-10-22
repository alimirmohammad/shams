<template>
  <div
    class="floating-action"
    :class="{ 'above-navigation': aboveNavigation }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
type Props = {
  aboveNavigation?: boolean;
};

defineProps<Props>();
</script>

<style scoped>
.floating-action {
  position: absolute;
  inset-inline: 1rem;
  bottom: calc(1.5rem + var(--safe-area-bottom));
  z-index: 10;
}

.above-navigation {
  /* The navigation already reserves the bottom safe area. */
  bottom: 1.5rem;
}
</style>
