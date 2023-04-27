<template>
  <div class="bg-white h-screen px-4 py-20 text-center">
    <Logo class="mx-auto" />
    <h1 class="my-4 text-primary-500 font-bold text-3xl">شمس</h1>
    <h4 class="mb-3 text-primary-500 headline-3">صندوق قرض الحسنه</h4>
    <h4 class="mb-12 text-primary-500 label-3">تأسیس ۱۳۸۲</h4>
    <div class="form-control w-full mb-8 relative">
      <label for="mobile" class="label">
        <span class="label-text label-3 text-gray-500">شماره موبایل</span>
      </label>
      <input
        type="tel"
        id="mobile"
        dir="ltr"
        class="mb-2 pr-14 input input-bordered input-primary w-full"
      />
      <span dir="ltr" class="absolute top-[50px] left-3 text-gray-500">
        +98 |
      </span>
      <p class="body-3 text-gray-500 text-start">
        لطفا شماره همراه را بدون صفر اول وارد کنید
      </p>
    </div>
    <div class="form-control w-full mb-12 relative">
      <label for="password" class="label">
        <span class="label-text label-3 text-gray-500">رمز عبور</span>
      </label>
      <input
        type="password"
        id="password"
        dir="ltr"
        class="input input-bordered input-primary w-full"
      />
      <Eye class="absolute top-[50px] right-3" />
    </div>
    <button type="submit" class="btn btn-primary btn-block label-1">
      ورود
    </button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.top-sheet {
  border-radius: 0px 0px 200px 200px;
}
</style>
