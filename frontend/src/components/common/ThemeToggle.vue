<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useThemeStore } from '../../stores/theme.js';

const themeStore = useThemeStore();
</script>

<template>
  <button
    type="button"
    @click="themeStore.toggleTheme"
    class="p-2 rounded-md border border-theme-coolgrey/40 dark:border-theme-darkgrey bg-white dark:bg-theme-almostblack text-theme-charcoal dark:text-theme-offwhite hover:bg-theme-coolgrey/20 dark:hover:bg-theme-darkgrey/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-theme-accent/40"
    :title="themeStore.isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
  >
    <Sun v-if="themeStore.isDark" class="w-4 h-4 text-amber-400" />
    <Moon v-else class="w-4 h-4 text-theme-charcoal" />
  </button>
</template>

