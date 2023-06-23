<template>
  <footer
    class="bg-white border-t border-gray-100 flex flex-row justify-around items-center py-1"
  >
    <NuxtLink :to="`/${userId}/loan`">
      <IconText title="وام‌ها" :neutral="isLoansNeutral">
        <EditIcon :neutral="isLoansNeutral" />
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
const { data: me } = useMe();
const userId = computed(() => me.value?.id);
const isLoansNeutral = computed(
  () => !['userId-share', 'userId-loan'].includes(routeName.value as string)
);
</script>
