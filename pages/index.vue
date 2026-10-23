<template>
  <div class="viewport-screen splash-page bg-primary-300">
    <div class="bg-white top-sheet">
      <Logo class="splash-logo" />
    </div>
    <div class="text-white text-center">
      <h1 class="splash-title font-bold text-5xl">شمس</h1>
      <div class="splash-suitcase relative mx-auto">
        <Suitcase class="w-full h-auto" />
        <div class="absolute top-1/2 inset-x-0">
          <h4 class="mb-4 headline-2">صندوق خانوادگی</h4>
          <h4 class="label-2">تأسیس ۱۳۷۷/۱/۵</h4>
        </div>
      </div>
    </div>
    <ToastError :error="error" :is-error="isError" />
  </div>
</template>

<script setup lang="ts">
const { data, isSuccess, isError, error } = useMe();
const minTimeElapsed = ref(false);

onMounted(async () => {
  await delay(2);
  minTimeElapsed.value = true;
});

watchEffect(() => {
  if (!isSuccess.value || !minTimeElapsed.value) return;
  if (!data.value) return navigateTo('/signin');
  if (data.value.mustChangePassword) return navigateTo('/change-password');
  if (data.value.role === 'ADMIN') return navigateTo('/people');
  navigateTo(`/${data.value.id}/share`);
});
</script>

<style scoped>
.top-sheet {
  display: grid;
  place-items: center;
  height: clamp(7rem, var(--viewport-height) * 0.36, 300px);
  border-radius: 0px 0px 200px 200px;
}

.splash-logo {
  width: clamp(4rem, var(--viewport-height) * 0.18, 140px);
  height: auto;
}

.splash-title {
  margin-block: clamp(0.75rem, var(--viewport-height) * 0.045, 2.5rem);
}

.splash-suitcase {
  width: min(298px, 85%, max(220px, var(--viewport-height) * 0.4));
}

.splash-page {
  padding-bottom: calc(1rem + var(--safe-area-bottom));
}
</style>
