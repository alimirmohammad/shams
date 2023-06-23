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
        <Spinner />
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
          id="query"
          label="جستجو"
          type="text"
          containerClass="mb-6"
        />
        <ul class="flex flex-col gap-4">
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
      </template>
    </main>
    <BottomNavigation />
    <BottomSheet :open="open" @close="open = false">
      <EditPerson @submit="createPerson" @close="open = false" />
    </BottomSheet>
    <Toast v-if="isToastVisible" toast-class="alert-error">
      {{ errorText }}
    </Toast>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { NuxtError } from 'nuxt/app';
import { Person } from '~/components/EditPerson.vue';

const query = ref('');
const open = ref(false);

const { data, error, isError, isSuccess, isLoading } = useQuery({
  queryKey: ['people'],
  queryFn: () => $fetch('/api/people'),
});

const { showToast, isToastVisible } = useToast();

const totalBalance = computed(() => data.value?.totalBalance ?? 0);
const people = computed(() => data.value?.users ?? []);

const errorText = computed<string>(
  () => (error.value as NuxtError)?.data.message ?? ''
);

const { mutatePerson } = useAddOrEditUser('add');

function createPerson(person: Person) {
  mutatePerson(person, () => (open.value = false));
}

watchEffect(() => {
  if (isError.value) {
    showToast();
  }
});
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
