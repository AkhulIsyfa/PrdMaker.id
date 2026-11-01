<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'change', page: number): void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page);
    emit('change', page);
  }
};
</script>

<template>
  <div class="flex items-center justify-between px-2 py-3">
    <div class="text-xs text-theme-coolgrey dark:text-theme-darkgrey">
      Menampilkan Halaman <span class="font-semibold text-theme-charcoal dark:text-theme-offwhite">{{ currentPage }}</span> dari <span class="font-semibold text-theme-charcoal dark:text-theme-offwhite">{{ totalPages }}</span>
    </div>

    <div class="flex items-center space-x-1">
      <!-- Prev Button -->
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="setPage(currentPage - 1)"
        class="p-1.5 rounded-md border border-theme-coolgrey/40 dark:border-theme-darkgrey bg-white dark:bg-theme-almostblack text-theme-charcoal dark:text-theme-offwhite hover:bg-theme-coolgrey/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        title="Halaman Sebelumnya"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Page Indicator / Number list -->
      <span class="px-3 py-1 text-xs font-medium rounded-md bg-theme-accent/10 dark:bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
        {{ currentPage }}
      </span>

      <!-- Next Button -->
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="setPage(currentPage + 1)"
        class="p-1.5 rounded-md border border-theme-coolgrey/40 dark:border-theme-darkgrey bg-white dark:bg-theme-almostblack text-theme-charcoal dark:text-theme-offwhite hover:bg-theme-coolgrey/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        title="Halaman Selanjutnya"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

