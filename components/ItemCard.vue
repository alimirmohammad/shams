<template>
  <div class="px-4 py-3 border border-primary-500 rounded-xl shadow-md">
    <div class="flex flex-row items-center justify-between">
      <div v-if="price" class="flex flex-row items-center gap-2">
        <span class="body-2 text-gray-900">{{ formattedPrice }}</span>
        <span class="body-3 text-gray-500">ریال</span>
      </div>
      <template v-if="title">
        <span>{{ title }}</span>
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
    <div
      v-if="username || link"
      class="flex flex-row items-center justify-between mt-2 body-2"
    >
      <span class="block text-gray-900 text-start justify-self-start">
        {{ username }}
      </span>
      <NuxtLink
        v-if="link"
        :to="link.url"
        class="block text-primary-500 justify-self-end"
      >
        {{ link.text }}
      </NuxtLink>
    </div>
    <p
      v-if="description"
      class="font-fa body-3 text-gray-900 mt-4 text-start"
      :class="{ truncate: !expanded }"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Props = {
  date?: string;
  description?: string | null;
  price?: number;
  title?: string;
  username?: string;
  expanded?: boolean;
  link?: { text: string; url: string };
};

type Emits = {
  (e: 'delete'): void;
  (e: 'edit'): void;
};

const props = defineProps<Props>();
defineEmits<Emits>();

const { data: me } = useMe();
const isAdmin = computed(() => me.value?.role === 'ADMIN');

const formattedPrice = computed(() =>
  props.price ? convertToPersianDigit(props.price) : ''
);
const jalali = computed(() =>
  props.date ? convertToJalaliString(props.date) : ''
);
</script>
