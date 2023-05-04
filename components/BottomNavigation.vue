<template>
  <footer class="bg-[#F1F1F1] flex flex-row justify-around items-center py-1">
    <NuxtLink to="/people">
      <IconText title="سهام‌داران" :neutral="routeName !== 'people'">
        <PersonIcon :neutral="routeName !== 'people'" />
      </IconText>
    </NuxtLink>
    <NuxtLink to="/reports">
      <IconText title="گزارشات" :neutral="routeName !== 'reports'">
        <ReportIcon :neutral="routeName !== 'reports'" />
      </IconText>
    </NuxtLink>
  </footer>
</template>

<script lang="ts" setup>
const route = useRoute();
const routeName = computed(() => route.name);
</script>
