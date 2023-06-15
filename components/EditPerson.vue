<template>
  <Form
    @submit="onSubmit"
    :validation-schema="editPersonSchema"
    class="font-fa"
  >
    <Input id="firstName" label="نام" type="text" containerClass="mb-10" />
    <Input
      id="lastName"
      label="نام خانوادگی"
      type="text"
      containerClass="mb-10"
    />
    <Input
      id="phoneNumber"
      label="شماره موبایل"
      placeholder="9121234567"
      dir="ltr"
      type="tel"
      inputClass="pr-14 font-fa"
      containerClass="mb-8"
    >
      <template #endAdornment>
        <span dir="ltr" class="text-gray-500"> +۹۸ | </span>
      </template>
      <template #helperText>
        <p class="body-3 text-gray-500 text-start">
          لطفا شماره همراه را بدون صفر اول وارد کنید
        </p>
      </template>
    </Input>
    <Input
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
