<template>
  <div>
    <h3 class="mt-0 mb-8 label-1 text-center">
      آیا از حذف این فیش اطمینان دارید؟
    </h3>
    <div class="flex flex-row justify-center items-center gap-4">
      <Button sm @click="$emit('confirm')"> حذف فیش </Button>
      <Button sm outline @click="$emit('close')"> پشیمان شدم </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = {
  (e: 'close'): void;
  (e: 'confirm'): void;
};

defineEmits<Emits>();
</script>
