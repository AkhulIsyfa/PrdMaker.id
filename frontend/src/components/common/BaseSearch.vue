<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Cari dokumen...',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('search', target.value);
};

const clearInput = () => {
  emit('update:modelValue', '');
  emit('search', '');
};
</script>

<template>
  <div class="relative flex items-center w-full">
    <!-- Left Search Icon -->
    <div class="absolute left-3 flex items-center pointer-events-none text-theme-coolgrey dark:text-theme-darkgrey">
      <Search class="w-4 h-4" />
    </div>

    <!-- Input Field -->
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      class="w-full pl-9 pr-9 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-theme-charcoal dark:text-theme-offwhite placeholder-theme-coolgrey dark:placeholder-theme-darkgrey focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all duration-300 text-sm disabled:opacity-50"
    />

    <!-- Right Clear Action -->
    <button
      v-if="modelValue"
      type="button"
      @click="clearInput"
      class="absolute right-3 flex items-center text-theme-coolgrey hover:text-theme-charcoal dark:hover:text-theme-offwhite transition-colors duration-200"
      title="Bersihkan pencarian"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

