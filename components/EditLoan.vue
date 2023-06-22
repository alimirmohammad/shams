<template>
  <Form @submit="onSubmit" :validation-schema="editLoanSchema" class="font-fa">
    <Select
      id="userId"
      label="وام گیرنده"
      :items="users"
      containerClass="mb-4"
    />
    <PersianDatePicker id="date" label="تاریخ" class="mb-4" />
    <Input
      id="amount"
      inputmode="numeric"
      label="مبلغ"
      dir="ltr"
      inputClass="pr-14"
      containerClass="mb-4"
      :formatter="commafy"
      :transformer="transformPrice"
    >
      <template #endAdornment>
        <span class="text-gray-500"> ریال </span>
      </template>
    </Input>
    <Input
      id="description"
      label="توضیحات"
      multiline
      rows="3"
      containerClass="mb-6"
    />
    <Button block type="submit"> ثبت فیش </Button>
  </Form>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { z } from 'zod';

type Emits = {
  (e: 'close'): void;
};

const emit = defineEmits<Emits>();
const schema = z.object({
  userId: z
    .string()
    .nonempty('انتخاب وام گیرنده الزامی است')
    .pipe(
      z.coerce
        .number()
        .int('شناسه کاربر باید عدد صحیح باشد')
        .positive('شناسه کاربر باید عدد مثبت باشد')
    ),
  amount: z
    .string()
    .nonempty('وارد کردن مبلغ الزامی است')
    .pipe(
      z.coerce
        .number()
        .int('مبلغ باید عدد صحیح باشد')
        .positive('مبلغ باید عدد مثبت باشد')
    ),
  date: z
    .string()
    .nonempty('وارد کردن تاریخ الزامی است')
    .pipe(
      z.coerce
        .date({
          required_error: 'وارد کردن تاریخ الزامی است',
          invalid_type_error: 'وارد کردن تاریخ الزامی است',
        })
        .max(new Date(), 'تاریخ نمی‌تواند در آینده باشد')
    ),
  description: z.string(),
});

const editLoanSchema = toTypedSchema(schema);

function onSubmit(values: unknown): void {
  mutate(values as z.infer<typeof schema>, {
    onSuccess: () => emit('close'),
  });
}

const queryClient = useQueryClient();

const { data: eligibleList } = useQuery({
  queryKey: ['eligible'],
  queryFn: () => $fetch('/api/people/eligible'),
});

const { mutate } = useMutation({
  mutationFn: (body: z.infer<typeof schema>) =>
    $fetch('/api/loans/add-loan', {
      method: 'POST',
      body,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(['eligible']);
    queryClient.invalidateQueries(['loans']);
  },
});

const users = computed(
  () =>
    eligibleList.value?.map(user => ({
      text: `${user.firstName} ${user.lastName}`,
      value: user.id.toString(),
    })) ?? []
);
</script>
