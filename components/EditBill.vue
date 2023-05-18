<template>
  <Form @submit="onSubmit" :validation-schema="editBillSchema">
    <Input
      id="price"
      inputmode="numeric"
      label="مبلغ"
      dir="ltr"
      inputClass="pr-14 font-fa"
      containerClass="mb-10"
      :formatter="commafy"
      :transformer="transformPrice"
    >
      <template #endAdornment>
        <span class="text-gray-500"> ریال </span>
      </template>
    </Input>
    <Input id="date" label="تاریخ" type="date" containerClass="mb-10" />
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

type Emits = {
  (e: 'close'): void;
};

defineEmits<Emits>();

const schema = z.object({
  price: z
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
    .pipe(z.coerce.date().max(new Date(), 'تاریخ نمی‌تواند در آینده باشد')),
  description: z.string(),
});

const editBillSchema = toTypedSchema(schema);

function onSubmit(values: unknown): void {
  console.log((values as z.infer<typeof schema>).price);
  alert(JSON.stringify(values, null, 2));
}
</script>
