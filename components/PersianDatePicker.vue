<template>
  <div :class="{ 'error-border': errorMessage }">
    <label :for="id" class="label">
      <span
        class="label-text label-3 text-gray-500"
        :class="{ 'text-red-500': errorMessage }"
      >
        {{ label }}
      </span>
    </label>
    <DatePicker
      :id="id"
      mode="single"
      :column="1"
      clearable
      @update:modelValue="handleChange($event, shouldValidate)"
      :modelValue="initialValue.split('T').at(0)"
      @close="handleChange(value)"
      @clear="handleChange(value)"
      inputmode="none"
      :styles="{ 'primary-color': '#6972F1' }"
    />
    <div v-if="errorMessage" class="mt-2">
      <span v-if="errorMessage" class="block body-3 text-red-500 text-start">
        {{ errorMessage }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  id: string;
  label: string;
  initialValue?: string;
  inputClass?: string;
  containerClass?: string;
};

type Emits = {
  (e: 'update:modelValue', value: string): void;
};

const props = withDefaults(defineProps<Props>(), {
  initialValue: '',
});
defineEmits<Emits>();

const { value, errorMessage, handleChange } = useValidation(
  props.id,
  props.initialValue
);

const shouldValidate = computed(() => Boolean(errorMessage.value));
</script>

<style scoped>
.error-border {
  :deep(.pdp) {
    @apply border border-red-500 rounded-md;
  }
}
</style>
