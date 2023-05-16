<template>
  <div class="px-4 py-3 border border-primary-500 rounded-xl shadow-md">
    <div class="flex flex-row items-center justify-between">
      <div v-if="price" class="flex flex-row items-center gap-2">
        <span class="body-2 text-gray-900">{{ formattedPrice }}</span>
        <span class="body-3 text-gray-500">ریال</span>
      </div>
      <span v-if="title">
        {{ title }}
      </span>
      <div class="flex flex-row items-center gap-5">
        <span class="body-2 text-gray-900">{{ date }}</span>
        <button @click="$emit('delete')">
          <DeleteIcon />
        </button>
        <button>
          <EditIcon />
        </button>
      </div>
    </div>
    <p class="body-3 text-gray-900 mt-4 text-start">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Props = {
  date: string;
  description: string;
  price?: number;
  title?: string;
};

type Emits = {
  (e: 'delete'): void;
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const formattedPrice = computed(() =>
  props.price ? convertToPersianDigit(props.price) : ''
);
</script>
