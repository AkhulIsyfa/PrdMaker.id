<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-theme-coolgrey/20 hover:bg-theme-coolgrey/40 text-theme-charcoal dark:text-theme-offwhite border border-theme-coolgrey/40 dark:border-theme-darkgrey active:scale-[0.98]';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-subtle active:scale-[0.98]';
    case 'primary':
    default:
      return 'bg-theme-accent hover:bg-theme-accentHover text-white border border-transparent shadow-subtle active:scale-[0.98]';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs';
    case 'lg':
      return 'px-6 py-3 text-lg';
    case 'md':
    default:
      return 'px-4 py-2 text-sm';
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="(e) => emit('click', e)"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      variantClasses,
      sizeClasses,
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>

