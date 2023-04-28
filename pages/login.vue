<template>
  <div class="bg-white h-screen px-4 py-20 text-center">
    <Logo class="mx-auto" />
    <h1 class="my-4 text-primary-500 font-bold text-3xl">شمس</h1>
    <h4 class="mb-3 text-primary-500 headline-3">صندوق قرض الحسنه</h4>
    <h4 class="mb-12 text-primary-500 label-3">تأسیس ۱۳۸۲</h4>
    <Input
      v-model="phone"
      id="mobile"
      label="شماره موبایل"
      placeholder="9121234567"
      dir="ltr"
      type="tel"
      inputClass="pr-14"
      containerClass="mb-8"
    >
      <template #endAdornment>
        <span dir="ltr" class="text-gray-500"> +98 | </span>
      </template>
      <template #helperText>
        <p class="body-3 text-gray-500 text-start">
          لطفا شماره همراه را بدون صفر اول وارد کنید
        </p>
      </template>
    </Input>
    <Input
      v-model="password"
      id="password"
      label="رمز عبور"
      dir="ltr"
      type="password"
      containerClass="mb-12"
    >
      <template #startAdornment>
        <Eye />
      </template>
    </Input>
    <button type="submit" class="btn btn-primary btn-block label-1">
      ورود
    </button>
  </div>
</template>

<script setup lang="ts">
const phone = ref('');
const password = ref('');
</script>

<style scoped>
.top-sheet {
  border-radius: 0px 0px 200px 200px;
}
</style>
