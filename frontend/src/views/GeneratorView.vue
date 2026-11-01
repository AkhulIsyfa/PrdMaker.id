<script setup lang="ts">
import { onMounted } from 'vue';
import { useDocumentStore } from '../stores/document';

const documentStore = useDocumentStore();

onMounted(() => {
  documentStore.fetchTemplates();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight text-theme-charcoal dark:text-theme-offwhite">
        Generator Dokumen Teknis
      </h1>
      <p class="text-sm text-theme-coolgrey dark:text-theme-darkgrey mt-1">
        Ubah deskripsi produk mentah menjadi spesifikasi Markdown arsitektur profesional.
      </p>
    </div>

    <div class="p-8 border border-dashed border-theme-coolgrey dark:border-theme-darkgrey rounded-lg text-center">
      <p class="text-sm text-theme-coolgrey dark:text-theme-darkgrey">
        Fondasi sistem komponen Vue 3 telah aktif. Komponen view interaktif lengkap akan dibangun pada Fase 7.
      </p>
    </div>
  </div>
</template>

