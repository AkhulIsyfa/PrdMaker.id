<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import BaseButton from '../components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  try {
    await authStore.register({
      full_name: fullName.value,
      email: email.value,
      password: password.value,
    });
    router.push('/');
  } catch {
    // Handled in store
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md p-8 rounded-xl border border-theme-coolgrey/40 dark:border-theme-borderDark bg-white dark:bg-theme-cardDark shadow-elevation">
      <h2 class="text-2xl font-bold text-center text-theme-charcoal dark:text-theme-offwhite mb-6">
        Daftar Akun Baru
      </h2>

      <div v-if="authStore.authError" class="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
        {{ authStore.authError }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-theme-charcoal dark:text-theme-offwhite mb-1">Nama Lengkap</label>
          <input
            v-model="fullName"
            type="text"
            required
            class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-theme-charcoal dark:text-theme-offwhite mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-theme-charcoal dark:text-theme-offwhite mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
            placeholder="Minimal 8 karakter"
          />
        </div>

        <BaseButton type="submit" :loading="authStore.isLoading" class="w-full mt-2">
          Buat Akun
        </BaseButton>
      </form>

      <p class="text-xs text-center text-theme-coolgrey dark:text-theme-darkgrey mt-6">
        Sudah memiliki akun?
        <router-link to="/login" class="text-theme-accent hover:underline font-medium">
          Masuk di sini
        </router-link>
      </p>
    </div>
  </div>
</template>

