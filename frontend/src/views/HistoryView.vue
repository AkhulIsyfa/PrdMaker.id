<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useDocumentStore } from '../stores/document';
import BaseSearch from '../components/common/BaseSearch.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseButton from '../components/common/BaseButton.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import { FileText, Download, Eye, X, Calendar, Clock, Cpu } from 'lucide-vue-next';

const documentStore = useDocumentStore();

const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedJob = ref<any | null>(null);

onMounted(async () => {
  await documentStore.fetchMyJobs(currentPage.value, pageSize.value);
});

const onPageChange = async (newPage: number) => {
  currentPage.value = newPage;
  await documentStore.fetchMyJobs(newPage, pageSize.value);
};

const filteredJobs = computed(() => {
  const list = documentStore.userJobs || [];
  if (!search.value.trim()) return list;
  const q = search.value.toLowerCase().trim();
  return list.filter(
    (j: any) =>
      (j.project_name && j.project_name.toLowerCase().includes(q)) ||
      (j.document_type && j.document_type.toLowerCase().includes(q))
  );
});

const openViewer = (job: any) => {
  selectedJob.value = job;
};

const closeViewer = () => {
  selectedJob.value = null;
};

const downloadJobMd = (job: any) => {
  const content = job.generated_content || job.content || '';
  if (!content) return;
  const fileName = `${job.project_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${job.document_type.toLowerCase()}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-theme-coolgrey/40 dark:border-theme-borderDark gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-theme-charcoal dark:text-theme-offwhite">
          Riwayat Dokumen Teknis
        </h1>
        <p class="text-sm text-theme-coolgrey dark:text-theme-darkgrey mt-1">
          Daftar seluruh artefak spesifikasi arsitektur yang pernah Anda hasilkan.
        </p>
      </div>

      <div class="w-full sm:w-72">
        <BaseSearch v-model="search" placeholder="Cari proyek atau tipe..." />
      </div>
    </div>

    <!-- Job List Table / Cards -->
    <div class="bg-white dark:bg-theme-cardDark rounded-xl border border-theme-coolgrey/40 dark:border-theme-borderDark overflow-hidden shadow-subtle">
      <div v-if="filteredJobs.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-theme-coolgrey/10 dark:bg-theme-almostblack border-b border-theme-coolgrey/30 dark:border-theme-borderDark text-xs text-theme-coolgrey dark:text-theme-darkgrey uppercase font-semibold">
            <tr>
              <th class="px-5 py-3.5">Proyek</th>
              <th class="px-5 py-3.5">Tipe Dokumen</th>
              <th class="px-5 py-3.5">Bahasa</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5">Metrik (Tokens / Latensi)</th>
              <th class="px-5 py-3.5">Tanggal</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-theme-coolgrey/20 dark:divide-theme-borderDark">
            <tr
              v-for="job in filteredJobs"
              :key="job.id"
              class="hover:bg-theme-coolgrey/5 dark:hover:bg-theme-almostblack/50 transition-colors"
            >
              <!-- Project Name -->
              <td class="px-5 py-4 font-semibold text-theme-charcoal dark:text-theme-offwhite">
                {{ job.project_name }}
              </td>

              <!-- Document Type Badge -->
              <td class="px-5 py-4">
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-theme-accent/10 dark:bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                  {{ job.document_type }}
                </span>
              </td>

              <!-- Language -->
              <td class="px-5 py-4 uppercase text-xs font-semibold text-theme-coolgrey dark:text-theme-darkgrey">
                {{ job.language }}
              </td>

              <!-- Status Badge -->
              <td class="px-5 py-4">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    job.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : job.status === 'FAILED'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
                  ]"
                >
                  {{ job.status }}
                </span>
              </td>

              <!-- Metrics -->
              <td class="px-5 py-4 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                <div class="flex items-center space-x-3">
                  <span class="flex items-center space-x-1" title="Total Tokens">
                    <Cpu class="w-3.5 h-3.5" />
                    <span>{{ (job.prompt_tokens || 0) + (job.candidate_tokens || 0) }}</span>
                  </span>
                  <span class="flex items-center space-x-1" title="Latensi">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{{ job.latency_ms || 0 }}ms</span>
                  </span>
                </div>
              </td>

              <!-- Created At -->
              <td class="px-5 py-4 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                <div class="flex items-center space-x-1">
                  <Calendar class="w-3.5 h-3.5" />
                  <span>{{ new Date(job.created_at).toLocaleDateString('id-ID') }}</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-right space-x-2">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openViewer(job)"
                  title="Lihat Pratinjau Dokumen"
                >
                  <Eye class="w-3.5 h-3.5 mr-1" />
                  Lihat
                </BaseButton>

                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="downloadJobMd(job)"
                  title="Unduh Berkas Markdown"
                >
                  <Download class="w-3.5 h-3.5" />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Bar -->
        <div class="border-t border-theme-coolgrey/30 dark:border-theme-borderDark">
          <BasePagination
            :current-page="currentPage"
            :total-items="documentStore.totalUserJobs"
            :page-size="pageSize"
            @update:current-page="onPageChange"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="py-16 flex flex-col items-center justify-center text-center text-theme-coolgrey dark:text-theme-darkgrey space-y-3"
      >
        <FileText class="w-12 h-12 opacity-30" />
        <p class="text-sm">Belum ada riwayat dokumen yang ditemukan.</p>
        <router-link to="/">
          <BaseButton variant="primary" size="sm">
            Buat Dokumen Sekarang
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Document Preview Modal -->
    <div
      v-if="selectedJob"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-theme-cardDark rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-theme-coolgrey/30 dark:border-theme-borderDark">
          <div class="flex items-center space-x-2">
            <h2 class="text-lg font-bold text-theme-charcoal dark:text-theme-offwhite">
              {{ selectedJob.project_name }}
            </h2>
            <span class="px-2 py-0.5 rounded text-xs bg-theme-accent/10 text-theme-accent font-medium">
              {{ selectedJob.document_type }}
            </span>
          </div>

          <button
            type="button"
            @click="closeViewer"
            class="text-theme-coolgrey hover:text-theme-charcoal dark:hover:text-theme-offwhite transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 p-6 overflow-hidden">
          <MarkdownViewer
            :content="selectedJob.generated_content || selectedJob.content || ''"
            :project-name="selectedJob.project_name"
            :document-type="selectedJob.document_type"
          />
        </div>
      </div>
    </div>
  </div>
</template>
