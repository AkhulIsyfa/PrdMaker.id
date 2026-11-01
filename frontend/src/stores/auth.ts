import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'PUBLIC';
  created_at?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('makeprd_token'));
  const isLoading = ref<boolean>(false);
  const authError = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  const setAuthData = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('makeprd_token', newToken);
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('makeprd_token');
  };

  const login = async (payload: { email: string; password: string }) => {
    isLoading.value = true;
    authError.value = null;
    try {
      const res = await authApi.login(payload);
      const data = res.data.data;
      setAuthData(data.token, data.user);
      return data;
    } catch (err: any) {
      authError.value = err.message || 'Login gagal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (payload: { email: string; password: string; full_name: string }) => {
    isLoading.value = true;
    authError.value = null;
    try {
      const res = await authApi.register(payload);
      const data = res.data.data;
      setAuthData(data.token, data.user);
      return data;
    } catch (err: any) {
      authError.value = err.message || 'Registrasi gagal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMe = async () => {
    if (!token.value) return;
    isLoading.value = true;
    try {
      const res = await authApi.getMe();
      user.value = res.data.data.user;
    } catch {
      clearAuth();
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    token,
    isLoading,
    authError,
    isAuthenticated,
    isAdmin,
    login,
    register,
    fetchMe,
    logout,
  };
});

