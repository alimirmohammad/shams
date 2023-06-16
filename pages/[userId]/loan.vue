<template>
  <div class="page">
    <Header class="font-fa" :title="title">
      <template #startAction>
        <IconButton>
          <ArrowRightIcon />
        </IconButton>
      </template>
      <template #endAction>
        <IconText title="ویرایش" @click="modal = 'edit-person'">
          <EditIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto shadow-xl p-4 pb-24">
      <Tabs :tabs="tabs" :active-tab="$route.path" class="mx-auto mb-4" />
      <div class="flex flex-row items-center justify-between mb-4">
        <IconText title="فیلتر">
          <FilterIcon />
        </IconText>
        <PriceSummary title="مانده وام" :price="debt" />
      </div>
      <ul class="flex flex-col gap-4">
        <li v-for="bill in bills" :key="bill.id">
          <ItemCard
            :price="bill.amount"
            :date="bill.date"
            :description="bill.description"
            @delete="modal = 'delete-bill'"
          />
        </li>
      </ul>
      <FixedBottom>
        <Button block @click="modal = 'edit-bill'">
          افزودن فیش
          <template #icon>
            <AddIcon white />
          </template>
        </Button>
      </FixedBottom>
    </main>
    <BottomSheet :open="modal === 'edit-bill'" @close="modal = 'none'">
      <EditBill @submit="editBill" @close="modal = 'none'" />
    </BottomSheet>
    <BottomSheet :open="modal === 'delete-bill'" @close="modal = 'none'">
      <DeleteBill @close="modal = 'none'" />
    </BottomSheet>
    <BottomSheet :open="modal === 'edit-person'" @close="modal = 'none'">
      <EditPerson
        @submit="editPerson"
        :person="person"
        @close="modal = 'none'"
      />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { Bill } from '~/components/EditBill.vue';
import { Person } from '~/components/EditPerson.vue';

const route = useRoute();
const userId = computed(() => route.params.userId);
const tabs = computed(() => [
  { label: 'سهام', to: `/${userId.value}/share` },
  { label: 'وام', to: `/${userId.value}/loan` },
]);

const { data } = useQuery({
  queryKey: ['loan', userId],
  queryFn: () => $fetch(`/api/people/${userId.value}/loan-bills`),
});

const name = computed(() => `${data.value?.firstName} ${data.value?.lastName}`);
const numOfSharesPersian = computed(() => data.value?.numOfShares);
const title = computed(() =>
  data.value ? `${name.value} (${numOfSharesPersian.value})` : ''
);

const lastLoan = computed(() => data.value?.loans.at(0));
const bills = computed(() => lastLoan.value?.bills ?? []);
const debt = computed(() => lastLoan.value?.debt ?? 0);
type Modal = 'edit-bill' | 'delete-bill' | 'edit-person' | 'none';
const modal = ref<Modal>('none');

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

const { mutatePerson } = useAddOrEditUser('edit');

const queryClient = useQueryClient();

function editPerson(person: Person) {
  mutatePerson({ ...person, id: data.value?.id }, () => {
    modal.value = 'none';
    queryClient.invalidateQueries({ queryKey: ['loan', userId] });
  });
}

const { mutate } = useMutation({
  mutationFn: (bill: Bill) =>
    $fetch(`/api/people/${userId.value}/loan-bills`, {
      method: 'POST',
      body: bill,
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['loan', userId] }),
});

function editBill(values: Bill) {
  mutate(values, {
    onSuccess: () => (modal.value = 'none'),
  });
}
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
