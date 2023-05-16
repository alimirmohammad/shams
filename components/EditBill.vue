<template>
  <div>
    <Input
      v-model="price"
      id="price"
      label="مبلغ"
      type="number"
      dir="ltr"
      inputClass="pr-14"
      containerClass="mb-10"
    >
      <template #endAdornment>
        <span class="text-gray-500"> ریال </span>
      </template>
    </Input>
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
    <Button block @click="$emit('close')"> ثبت فیش </Button>
  </div>
</template>

<script setup lang="ts">
const price = ref('');
const date = ref('');
const description = ref('');

type Emits = {
  (e: 'close'): void;
};

defineEmits<Emits>();
</script>
