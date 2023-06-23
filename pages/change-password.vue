<template>
  <Form
    @submit="onSubmit"
    :validation-schema="changePasswordSchema"
    class="bg-white h-screen px-4 py-20 text-center"
  >
    <Logo class="mx-auto" />
    <h1 class="my-4 text-primary-500 font-bold text-3xl">شمس</h1>
    <h4 class="mb-3 text-primary-500 headline-3">صندوق خانوادگی</h4>
    <h4 class="mb-12 text-primary-500 label-3">تأسیس ۱۳۸۲</h4>
    <Input
      id="password"
      label="رمز عبور جدید"
      dir="ltr"
      type="password"
      containerClass="mb-12"
    >
      <template #startAdornment>
        <EyeIcon />
      </template>
    </Input>
    <Button type="submit" block> تغییر رمز عبور </Button>
    <Toast v-if="isToastVisible" toast-class="alert-error">
      {{ errorText }}
    </Toast>
  </Form>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import { NuxtError } from 'nuxt/app';
import { z } from 'zod';
import useToast from '~/composables/useToast';

const schema = z.object({
  password: z
    .string()
    .nonempty('پر کردن این فیلد الزامی است')
    .min(4, 'رمز عبور حداقل ۴ کاراکتر دارد'),
});

const changePasswordSchema = toTypedSchema(schema);
type Payload = z.infer<typeof schema>;

const { showToast, isToastVisible } = useToast();

const { mutate, error, isError } = useMutation({
  mutationFn: (body: z.infer<typeof schema>) =>
    $fetch(`/api/auth/change-password`, {
      method: 'POST',
      body,
    }),
});

const errorText = computed(
  () => (error.value as NuxtError)?.data.message ?? ''
);

async function onSubmit(values: unknown) {
  mutate(values as Payload, {
    onSuccess: () => navigateTo('/signin'),
  });
}

watchEffect(() => {
  if (isError.value) {
    showToast();
  }
});
</script>
