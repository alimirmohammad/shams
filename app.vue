<template>
  <Html lang="fa-IR" dir="rtl" class="h-full w-full bg-slate-500">
    <Body dir="rtl" class="max-w-sm m-auto h-full w-full">
      <!-- <div>
        <Logo width="300" height="300" />
        <Tabs :tabs="tabs" v-model="active" />
      </div> -->
      <NuxtPage />
    </Body>
  </Html>
</template>

<script setup lang="ts">
const tabs = [
  { label: 'سهام', value: 'saham' },
  { label: 'وام', value: 'vam' },
];

const active = ref(tabs[0].value);
</script>
