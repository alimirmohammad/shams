<template>
  <div class="page">
    <Header class="font-fa" :title="title">
      <div
        v-if="personIsLoading"
        class="flex items-center justify-center w-full h-full bg-white"
      >
        <LoadingRipple />
      </div>
      <template v-if="isAdmin" #startAction>
        <IconButton @click="navigateTo('/people')">
          <ArrowRightIcon />
        </IconButton>
      </template>
      <template v-if="isAdmin" #endAction>
        <IconText title="ویرایش" @click="showPersonModal = true">
          <EditIcon />
        </IconText>
      </template>
    </Header>
    <div
      v-if="personIsLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <main v-else class="bg-white text-center overflow-auto shadow-xl p-4 pb-24">
      <Tabs :tabs="tabs" :active-tab="$route.path" class="mx-auto mb-4" />
      <div class="flex flex-row items-center justify-between mb-4">
        <slot name="header" />
      </div>
      <slot />
    </main>
    <slot name="bottom-sheet" />
    <BottomSheet
      v-if="isAdmin"
      :open="showPersonModal"
      @close="showPersonModal = false"
    >
      <EditPerson
        @submit="editPerson"
        :person="person"
        @close="showPersonModal = false"
        :loading="isLoading"
      />
    </BottomSheet>
    <ToastError
      :error="error || personError"
      :is-error="isError || personIsError"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { Person } from '~/components/EditPerson.vue';

const route = useRoute();
const userId = computed(() => route.params.userId);
const tabs = computed(() => [
  { label: 'سهام', to: `/${userId.value}/share` },
  { label: 'وام', to: `/${userId.value}/loan` },
]);

const { data: me } = useMe();
const isAdmin = computed(() => me.value?.role === 'ADMIN');

const {
  data,
  isLoading: personIsLoading,
  isError: personIsError,
  error: personError,
} = useQuery({
  queryKey: ['loan', userId],
  queryFn: () => $fetch(`/api/people/${userId.value}/loan-bills`),
});

const name = computed(() => `${data.value?.firstName} ${data.value?.lastName}`);
const numOfSharesPersian = computed(() => data.value?.numOfShares);
const title = computed(() =>
  data.value ? `${name.value} (${numOfSharesPersian.value})` : ''
);

const showPersonModal = ref(false);

const person = computed(() =>
  data.value
    ? {
        id: data.value.id,
        firstName: data.value.firstName,
        lastName: data.value.lastName,
        phoneNumber: data.value.phoneNumber,
        numOfShares: data.value.numOfShares,
      }
    : undefined
);

const { mutatePerson, error, isError, isLoading } = useAddOrEditUser('edit');

const queryClient = useQueryClient();

function editPerson(person: Person) {
  mutatePerson({ ...person, id: data.value?.id }, () => {
    showPersonModal.value = false;
    return queryClient.invalidateQueries({ queryKey: ['loan', userId] });
  });
}
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
