<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import ThemeToggle from './components/common/ThemeToggle.vue';
import BaseButton from './components/common/BaseButton.vue';
import { Sparkles, FileText, LayoutDashboard, LogOut, LogIn } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(async () => {
  themeStore.initTheme();
  if (authStore.token && !authStore.user) {
    await authStore.fetchMe();
  }
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-theme-almostblack text-theme-charcoal dark:text-theme-offwhite transition-colors duration-300">
    <!-- Top Navigation Header -->
    <header class="border-b border-theme-coolgrey/40 dark:border-theme-borderDark bg-white/80 dark:bg-theme-almostblack/80 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Brand Logo -->
        <router-link to="/" class="flex items-center space-x-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-theme-accent flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform duration-300">
            <Sparkles class="w-5 h-5" />
          </div>
          <span class="font-bold text-lg tracking-tight">Make<span class="text-theme-accent">PRD</span></span>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center space-x-6 text-sm font-medium">
          <router-link
            to="/"
            class="text-theme-coolgrey hover:text-theme-charcoal dark:hover:text-theme-offwhite transition-colors"
            active-class="!text-theme-accent font-semibold"
          >
            Generator
          </router-link>

          <router-link
            v-if="authStore.isAuthenticated"
            to="/history"
            class="text-theme-coolgrey hover:text-theme-charcoal dark:hover:text-theme-offwhite transition-colors flex items-center space-x-1.5"
            active-class="!text-theme-accent font-semibold"
          >
            <FileText class="w-4 h-4" />
            <span>Riwayat</span>
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="text-theme-coolgrey hover:text-theme-charcoal dark:hover:text-theme-offwhite transition-colors flex items-center space-x-1.5"
            active-class="!text-theme-accent font-semibold"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Admin</span>
          </router-link>
        </nav>

        <!-- Right Action Group -->
        <div class="flex items-center space-x-3">
          <ThemeToggle />

          <!-- Auth Actions -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-3">
            <span class="text-xs text-theme-coolgrey dark:text-theme-darkgrey hidden sm:inline-block">
              {{ authStore.user?.full_name }}
              <span v-if="authStore.isAdmin" class="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-theme-accent/10 text-theme-accent border border-theme-accent/30 font-semibold">
                ADMIN
              </span>
            </span>

            <BaseButton variant="secondary" size="sm" @click="handleLogout" title="Keluar">
              <LogOut class="w-3.5 h-3.5" />
            </BaseButton>
          </div>

          <div v-else class="flex items-center space-x-2">
            <router-link to="/login">
              <BaseButton variant="secondary" size="sm">
                <LogIn class="w-3.5 h-3.5 mr-1.5" />
                Masuk
              </BaseButton>
            </router-link>
            <router-link to="/register">
              <BaseButton variant="primary" size="sm">
                Daftar
              </BaseButton>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content View -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-theme-coolgrey/40 dark:border-theme-borderDark py-6 text-center text-xs text-theme-coolgrey dark:text-theme-darkgrey">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 MakePRD.id - Autonomous Technical Documentation Engine</p>
        <p class="caption">Design System: Monochromatic Neutral • Inter Font • 300ms Transition</p>
      </div>
    </footer>
  </div>
</template>

