<template>
  <div>
    <h3 class="mt-0 mb-8 label-1 text-center">
      {{ title }}
    </h3>
    <div class="flex flex-row justify-center items-center gap-4">
      <Button sm @click="$emit('confirm')"> {{ okLabel }} </Button>
      <Button sm outline @click="$emit('close')"> {{ cancelLabel }} </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  okLabel: string;
  cancelLabel: string;
};

type Emits = {
  (e: 'close'): void;
  (e: 'confirm'): void;
};

defineProps<Props>();
defineEmits<Emits>();
</script>
