<template>
  <div class="form-control w-full relative" :class="containerClass">
    <label :for="id" class="label">
      <span
        class="label-text label-3 text-gray-500"
        :class="{ 'text-red-500': errorMessage }"
      >
        {{ label }}
      </span>
    </label>
    <component
      :is="multiline ? 'textarea' : 'input'"
      :id="id"
      v-bind="$attrs"
      :value="formatter(value)"
      v-on="validationListeners"
      class="w-full"
      :class="[
        inputClass,
        {
          'textarea textarea-bordered textarea-lg': multiline,
          'input input-bordered': !multiline,
          'textarea-primary': multiline && !errorMessage,
          'input-primary': !multiline && !errorMessage,
          'textarea-error': multiline && errorMessage,
          'input-error': !multiline && errorMessage,
        },
      ]"
    />
    <div v-if="$slots.startAdornment" class="absolute top-[50px] right-3">
      <slot name="startAdornment" />
    </div>
    <div v-if="$slots.endAdornment" class="absolute top-[50px] left-3">
      <slot name="endAdornment" />
    </div>
    <div v-if="errorMessage || $slots.helperText" class="mt-2">
      <span v-if="errorMessage" class="block body-3 text-red-500 text-start">
        {{ errorMessage }}
      </span>
      <slot v-else name="helperText" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  id: string;
  label: string;
  initialValue?: string;
  error?: boolean;
  errorText?: string;
  inputClass?: string;
  containerClass?: string;
  multiline?: boolean;
  formatter?: (value: string) => string;
  transformer?: (e: Event) => string;
};

type Emits = {
  (e: 'update:modelValue', value: string): void;
};

const props = withDefaults(defineProps<Props>(), {
  initialValue: '',
  formatter: (value: string) => value,
});

defineEmits<Emits>();

const { value, errorMessage, validationListeners } = useValidation(
  props.id,
  props.initialValue,
  props.transformer
);
</script>

<script lang="ts">
export default defineComponent({
  inheritAttrs: false,
});
</script>
