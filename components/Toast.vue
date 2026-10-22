<template>
  <div class="toast">
    <div class="alert" :class="toastClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type ToastClass =
  | 'alert-info'
  | 'alert-success'
  | 'alert-warning'
  | 'alert-error';

type Props = {
  toastClass?: ToastClass;
};

defineProps<Props>();
</script>

<style scoped>
.toast {
  left: 50%;
  right: auto;
  bottom: calc(1rem + var(--safe-area-bottom));
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 0;
  width: calc(100% - 2rem - var(--safe-area-left) - var(--safe-area-right));
  max-width: 26rem;
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem - var(--safe-area-top) - var(--safe-area-bottom));
  overflow-y: auto;
}
</style>
