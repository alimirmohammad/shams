<template>
  <div class="h-screen bg-primary-300">
    <div class="h-[300px] bg-white relative top-sheet">
      <Logo class="absolute top-20 left-1/2 -translate-x-1/2" />
    </div>
    <div class="text-white text-center">
      <h1 class="font-bold text-5xl my-10">شمس</h1>
      <div class="relative">
        <Suitcase class="mx-auto" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2">
          <h4 class="mb-4 headline-2">صندوق قرض الحسنه</h4>
          <h4 class="label-2">تأسیس ۱۳۸۲</h4>
        </div>
      </div>
    </div>
    <ToastError :error="error" :is-error="isError" />
  </div>
</template>

<script setup lang="ts">
const { data, isSuccess, isError, error } = useMe();

watchEffect(async () => {
  await delay(2);
  if (!isSuccess.value) return;
  if (!data.value) return navigateTo('/signin');
  if (data.value.mustChangePassword) return navigateTo('/change-password');
  if (data.value.role === 'ADMIN') return navigateTo('/people');
  navigateTo(`/${data.value.id}/share`);
});
</script>

<style scoped>
.top-sheet {
  border-radius: 0px 0px 200px 200px;
}
</style>
