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
