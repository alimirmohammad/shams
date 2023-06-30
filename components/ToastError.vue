<template>
  <Toast v-if="isToastVisible" class="z-[1000]" toast-class="alert-error">
    <span class="text-white">{{ errorText }}</span>
  </Toast>
</template>

<script setup lang="ts">
import { NuxtError } from 'nuxt/app';

type Props = {
  error: unknown;
  isError: boolean;
};

const props = defineProps<Props>();

const { showToast, isToastVisible } = useToast();

const errorText = computed(
  () =>
    (props.error as NuxtError)?.data?.message ??
    'متاسفانه مشکلی پیش آمده، دوباره تلاش کنید.'
);

watchEffect(() => {
  if (props.isError) {
    showToast();
  }
});
</script>
