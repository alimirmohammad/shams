<template>
  <div class="page">
    <Header title="سهام‌داران">
      <template #startAction>
        <IconText title="افزودن" @click="open = true">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto p-4">
      <div v-if="isLoading" class="h-full flex items-center justify-center">
        <LoadingRipple />
      </div>
      <template v-if="isSuccess">
        <PriceSummary
          title="ارزش کل صندق"
          :price="totalBalance"
          lg
          class="mb-10"
        />
        <Input
          v-model="query"
          no-validate
          id="query"
          label="جستجو"
          type="search"
          inputClass="px-10"
          containerClass="mb-6"
          placeholder="نام سهام‌دار مورد نظر را جستجو کنید"
        >
          <template #startAdornment>
            <SearchIcon />
          </template>
        </Input>
        <ul v-if="people.length > 0" class="flex flex-col gap-4">
          <li v-for="person in people">
            <NuxtLink :to="`/${person.id}/share`">
              <PersonCard
                :name="`${person.firstName} ${person.lastName}`"
                :numOfShares="person.numOfShares"
                :debt="person.debt"
              />
            </NuxtLink>
          </li>
        </ul>
        <EmptyState v-else />
      </template>
    </main>
    <BottomNavigation />
    <BottomSheet :open="open" @close="open = false">
      <EditPerson
        @submit="createPerson"
        @close="open = false"
        :loading="upsertLoading"
      />
    </BottomSheet>
    <ToastError
      :error="error || upsertError"
      :is-error="isError || upsertIsError"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { Person } from '~/components/EditPerson.vue';

const query = ref('');
const open = ref(false);

const { data, error, isError, isSuccess, isLoading } = useQuery({
  queryKey: ['people'],
  queryFn: () => $fetch('/api/people'),
});

const totalBalance = computed(() => data.value?.totalBalance ?? 0);
const people = computed(
  () =>
    data.value?.users.filter(
      user =>
        user.firstName.includes(query.value) ||
        user.lastName.includes(query.value)
    ) ?? []
);

const {
  mutatePerson,
  isLoading: upsertLoading,
  isError: upsertIsError,
  error: upsertError,
} = useAddOrEditUser('add');

function createPerson(person: Person) {
  mutatePerson(person, () => (open.value = false));
}
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
