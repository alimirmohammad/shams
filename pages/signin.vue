<template>
  <Form
    @submit="onSubmit"
    :validation-schema="loginSchema"
    class="bg-white viewport-screen auth-page signin-page text-center"
  >
    <Logo class="signin-logo mx-auto" />
    <h1 class="signin-title text-primary-500 font-bold text-3xl">شمس</h1>
    <h4 class="signin-subtitle text-primary-500 headline-3">صندوق خانوادگی</h4>
    <h4 class="signin-founded text-primary-500 label-3">تأسیس ۱۳۷۷</h4>
    <Input
      id="phoneNumber"
      label="شماره موبایل"
      placeholder="9121234567"
      dir="ltr"
      type="tel"
      inputClass="pr-14 font-fa"
      containerClass="signin-phone"
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
      :type="showPassword ? 'text' : 'password'"
      containerClass="signin-password"
    >
      <template #startAdornment>
        <IconButton @click="showPassword = !showPassword" type="button">
          <EyeSlashIcon v-if="showPassword" />
          <EyeIcon v-else />
        </IconButton>
      </template>
    </Input>
    <Button type="submit" block :loading="isLoading"> ورود </Button>
    <ToastError :error="error" :is-error="isError" />
  </Form>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { z } from 'zod';

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
type Payload = z.infer<typeof schema>;
const queryClient = useQueryClient();
const showPassword = ref(false);

const { mutate, error, isError, isLoading } = useMutation({
  mutationFn: (body: Payload) =>
    $fetch('/api/auth/signin', {
      method: 'POST',
      body,
    }),
  onSuccess: res => {
    queryClient.setQueryData(['me'], res);
    if (res.mustChangePassword) return navigateTo('/change-password');
    if (res.role === 'ADMIN') return navigateTo('/people');
    navigateTo(`/${res.id}/share`);
  },
});

async function onSubmit(values: unknown) {
  mutate(values as Payload);
}
</script>

<style scoped>
.signin-page {
  padding-top: calc(clamp(1rem, (var(--viewport-height) - 560px) / 4, 5rem) + var(--safe-area-top));
  padding-bottom: calc(clamp(1rem, (var(--viewport-height) - 560px) / 4, 5rem) + var(--safe-area-bottom));
}

.signin-logo {
  width: clamp(4rem, var(--viewport-height) * 0.14, 8.75rem);
  height: auto;
}

.signin-title {
  margin-block: clamp(0.5rem, var(--viewport-height) * 0.01, 1rem);
}

.signin-subtitle {
  margin-bottom: clamp(0.25rem, var(--viewport-height) * 0.01, 0.75rem);
}

.signin-founded,
.signin-phone {
  margin-bottom: clamp(0.75rem, (var(--viewport-height) - 560px) / 8, 2rem);
}

.signin-password {
  margin-bottom: clamp(1rem, (var(--viewport-height) - 560px) / 6, 3rem);
}

@media (max-height: 650px) {
  .signin-logo {
    width: 4rem;
  }

  .signin-title {
    margin-block: 0.25rem;
    font-size: 1.5rem;
    line-height: 1.875rem;
  }
}
</style>
