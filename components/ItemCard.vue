<template>
  <div class="px-4 py-3 border border-primary-500 rounded-xl shadow-md">
    <div class="flex flex-row items-center justify-between">
      <div v-if="price" class="flex flex-row items-center gap-2">
        <span class="body-2 text-gray-900">{{ formattedPrice }}</span>
        <span class="body-3 text-gray-500">ریال</span>
      </div>
      <template v-if="title">
        <NuxtLink v-if="to" :to="to">{{ title }}</NuxtLink>
        <span v-else>{{ title }}</span>
      </template>
      <div class="flex flex-row items-center gap-5">
        <span class="body-2 text-gray-900">{{ jalali }}</span>
        <button v-if="isAdmin" @click="$emit('delete')">
          <DeleteIcon />
        </button>
        <button v-if="isAdmin" @click="$emit('edit')">
          <EditIcon />
        </button>
      </div>
    </div>
    <span v-if="username" class="block body-2 text-gray-900 mt-2 text-start">
      {{ username }}
    </span>
    <p v-if="description" class="body-3 text-gray-900 mt-4 text-start truncate">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Role } from '@prisma/client';

type Props = {
  date?: string;
  description?: string | null;
  price?: number;
  title?: string;
  username?: string;
  to?: string;
};

type Emits = {
  (e: 'delete'): void;
  (e: 'edit'): void;
};

const props = defineProps<Props>();
defineEmits<Emits>();

const { data: me } = useMe();
const isAdmin = computed(() => me.value?.role === Role.ADMIN);

const formattedPrice = computed(() =>
  props.price ? convertToPersianDigit(props.price) : ''
);
const jalali = computed(() =>
  props.date ? convertToJalaliString(props.date) : ''
);
</script>
