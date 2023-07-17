<template>
  <div>
    <h3 class="mt-0 mb-8 label-1 text-center">
      {{ title }}
    </h3>
    <div class="flex flex-row justify-center items-center gap-4">
      <Button sm @click="$emit('confirm')" :loading="loading" class="flex-1">
        {{ okLabel }}
      </Button>
      <Button sm outline @click="$emit('close')" class="flex-1">
        {{ cancelLabel }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  okLabel: string;
  cancelLabel: string;
  loading?: boolean;
};

type Emits = {
  (e: 'close'): void;
  (e: 'confirm'): void;
};

defineProps<Props>();
defineEmits<Emits>();
</script>
