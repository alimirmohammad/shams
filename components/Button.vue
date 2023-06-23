<template>
  <button
    type="submit"
    class="btn btn-primary flex flex-row items-center justify-center gap-2"
    :disabled="loading"
    :class="{
      'label-1': !sm,
      'label-3': sm,
      'btn-outline': outline,
      'btn-block': block,
    }"
  >
    <LoadingEllipsis v-if="loading" class="scale-50 -translate-y-1/4" />
    <template v-else>
      <slot />
      <slot name="icon" />
    </template>
  </button>
</template>

<script setup lang="ts">
type Props = {
  block?: boolean;
  outline?: boolean;
  sm?: boolean;
  loading?: boolean;
};

defineProps<Props>();
</script>
