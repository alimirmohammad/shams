<template>
  <div>
    <Input
      v-model="title"
      id="title"
      label="عنوان"
      type="text"
      containerClass="mb-10"
    />
    <Input
      v-model="date"
      id="date"
      label="تاریخ"
      type="date"
      containerClass="mb-10"
    />
    <Input
      v-model="description"
      id="description"
      label="توضیحات"
      multiline
      rows="5"
      containerClass="mb-10"
    />
    <Button block @click="$emit('close')">
      ثبت گزارش
      <template #icon>
        <TickSquareIcon white />
      </template>
    </Button>
  </div>
</template>

<script setup lang="ts">
const title = ref('');
const date = ref('');
const description = ref('');

type Emits = {
  (e: 'close'): void;
};

defineEmits<Emits>();
</script>
