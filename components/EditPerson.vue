<template>
  <Form
    @submit="onSubmit"
    :validation-schema="editPersonSchema"
    class="font-fa"
  >
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
    <Button block type="submit">ثبت سهام دار</Button>
  </Form>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { z } from 'zod';

type Emits = {
  (e: 'close'): void;
};

const emit = defineEmits<Emits>();
const schema = z.object({
  firstName: z.string().nonempty('وارد کردن نام الزامی است'),
  lastName: z.string().nonempty('وارد کردن نام خانوادگی الزامی است'),
  phoneNumber: z
    .string()
    .nonempty('پر کردن این فیلد الزامی است')
    .regex(/^9\d{9}$/, 'فرمت وارد شده برای موبایل صحیح نیست'),
  numOfShares: z
    .string()
    .nonempty('وارد کردن تعداد سهام الزامی است')
    .pipe(
      z.coerce
        .number()
        .int('تعداد سهام باید عدد صحیح باشد')
        .positive('تعداد سهام باید عدد مثبت باشد')
    ),
});

const editPersonSchema = toTypedSchema(schema);
const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: (values: z.infer<typeof schema>) =>
    $fetch('/api/auth/signup', {
      method: 'POST',
      body: values,
    }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people'] }),
});

function onSubmit(values: unknown): void {
  mutate(values as z.infer<typeof schema>, {
    onSuccess: () => emit('close'),
  });
}
</script>

<style scoped></style>
