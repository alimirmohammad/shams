<template>
  <Form @submit="onSubmit" :validation-schema="editBillSchema" class="font-fa">
    <PersianDatePicker id="date" label="تاریخ" class="mb-6" />
    <Input
      id="amount"
      inputmode="numeric"
      label="مبلغ"
      dir="ltr"
      inputClass="pr-14"
      containerClass="mb-6"
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
      rows="5"
      containerClass="mb-10"
    />
    <Button block type="submit"> ثبت فیش </Button>
  </Form>
</template>

<script setup lang="ts">
import { z } from 'zod';

const schema = z.object({
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

const editBillSchema = toTypedSchema(schema);
export type Bill = z.infer<typeof schema>;

type Emits = {
  (e: 'close'): void;
  (e: 'submit', bill: Bill): void;
};

const emit = defineEmits<Emits>();

function onSubmit(values: unknown): void {
  emit('submit', values as Bill);
}
</script>
