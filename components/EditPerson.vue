<template>
  <div>
    <Input
      v-model="firstName"
      id="firstName"
      label="نام"
      type="text"
      containerClass="mb-10"
    />
    <Input
      v-model="lastName"
      id="lastName"
      label="نام خانوادگی"
      type="text"
      containerClass="mb-10"
    />
    <Input
      v-model="phoneNumber"
      id="phoneNumber"
      label="شماره موبایل"
      dir="ltr"
      type="tel"
      containerClass="mb-10"
    />
    <Input
      v-model="numOfShares"
      id="numOfShares"
      label="تعداد سهام"
      dir="ltr"
      type="number"
      containerClass="mb-14"
    />
    <Button block @click="$emit('close')">ثبت سهام دار</Button>
  </div>
</template>

<script setup lang="ts">
const firstName = ref('');
const lastName = ref('');
const phoneNumber = ref('');
const numOfShares = ref('');

type Emits = {
  (e: 'close'): void;
};

defineEmits<Emits>();
</script>

<style scoped></style>
