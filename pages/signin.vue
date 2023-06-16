<template>
  <Form
    @submit="onSubmit"
    :validation-schema="loginSchema"
    class="bg-white h-screen px-4 py-20 text-center"
  >
    <Logo class="mx-auto" />
    <h1 class="my-4 text-primary-500 font-bold text-3xl">شمس</h1>
    <h4 class="mb-3 text-primary-500 headline-3">صندوق قرض الحسنه</h4>
    <h4 class="mb-12 text-primary-500 label-3">تأسیس ۱۳۸۲</h4>
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
      id="password"
      label="رمز عبور"
      dir="ltr"
      type="password"
      containerClass="mb-12"
    >
      <template #startAdornment>
        <EyeIcon />
      </template>
    </Input>
    <Button type="submit" block> ورود </Button>
    <Toast v-if="isToastVisible" toast-class="alert-error"> {{ err }} </Toast>
  </Form>
</template>

<script setup lang="ts">
import { Role } from '@prisma/client';
import { NuxtError } from 'nuxt/app';
import { z } from 'zod';
import useToast from '~/composables/useToast';

const schema = z.object({
  phoneNumber: z
    .string()
    .nonempty('پر کردن این فیلد الزامی است')
    .regex(/^9\d{9}$/, 'فرمت وارد شده برای موبایل صحیح نیست'),
  password: z
    .string()
    .nonempty('پر کردن این فیلد الزامی است')
    .min(4, 'رمز عبور حداقل ۴ کاراکتر دارد'),
});

const loginSchema = toTypedSchema(schema);

const { showToast, isToastVisible } = useToast();
const err = ref('');

async function onSubmit(values: unknown) {
  const { phoneNumber, password } = values as z.infer<typeof schema>;
  try {
    const { role, id } = await $fetch('/api/auth/signin', {
      method: 'POST',
      body: { phoneNumber, password },
    });
    if (role === Role.ADMIN) {
      navigateTo('/people');
    } else {
      navigateTo(`/${id}/share`);
    }
  } catch (e) {
    err.value = (e as NuxtError).data.message;
    showToast();
  }
}
</script>