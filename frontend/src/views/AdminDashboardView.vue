<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminApi } from '../api/client';
import BaseSearch from '../components/common/BaseSearch.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseButton from '../components/common/BaseButton.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import {
  Activity,
  Layers,
  Cpu,
  Clock,
  Users,
  Eye,
  X,
  RefreshCw,
  Calendar,
} from 'lucide-vue-next';

interface MetricData {
  jobs: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    total_tokens: number;
    avg_latency_ms: number;
  };
  users: {
    total: number;
    admin: number;
    public: number;
  };
}

const metrics = ref<MetricData | null>(null);
const allJobs = ref<any[]>([]);
const totalJobsCount = ref(0);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(15);
const isLoading = ref(false);
const selectedJob = ref<any | null>(null);

const loadData = async () => {
  isLoading.value = true;
  try {
    const [metricRes, jobsRes] = await Promise.all([
      adminApi.getMetrics(),
      adminApi.getJobs({
        limit: pageSize.value,
        offset: (currentPage.value - 1) * pageSize.value,
      }),
    ]);
    metrics.value = metricRes.data.data;
    allJobs.value = jobsRes.data.data;
    totalJobsCount.value = jobsRes.data.meta.total;
  } catch (err) {
    console.error('Failed to load admin data', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadData();
});

const onPageChange = async (newPage: number) => {
  currentPage.value = newPage;
  await loadData();
};

const filteredJobs = computed(() => {
  if (!search.value.trim()) return allJobs.value;
  const q = search.value.toLowerCase().trim();
  return allJobs.value.filter(
    (j) =>
      (j.project_name && j.project_name.toLowerCase().includes(q)) ||
      (j.document_type && j.document_type.toLowerCase().includes(q)) ||
      (j.id && j.id.toLowerCase().includes(q))
  );
});

const openViewer = (job: any) => {
  selectedJob.value = job;
};

const closeViewer = () => {
  selectedJob.value = null;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-theme-coolgrey/40 dark:border-theme-borderDark gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <Activity class="w-6 h-6 text-theme-accent" />
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-theme-charcoal dark:text-theme-offwhite">
            Admin Monitoring Hub
          </h1>
        </div>
        <p class="text-sm text-theme-coolgrey dark:text-theme-darkgrey mt-1">
          Pusat pemantauan aktivitas pembuatan dokumen, konsumsi token AI, latensi sistem, dan status transaksi.
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="loadData">
          <RefreshCw class="w-3.5 h-3.5 mr-1.5" />
          Segarkan Data
        </BaseButton>
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div v-if="metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Card 1: Total Jobs -->
      <div class="p-5 rounded-xl bg-white dark:bg-theme-cardDark border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-subtle">
        <div class="flex items-center justify-between text-theme-coolgrey dark:text-theme-darkgrey mb-2">
          <span class="text-xs font-semibold uppercase">Total Jobs</span>
          <Layers class="w-4 h-4 text-theme-accent" />
        </div>
        <div class="text-2xl font-bold text-theme-charcoal dark:text-theme-offwhite">
          {{ metrics.jobs.total }}
        </div>
        <div class="text-xs text-theme-coolgrey dark:text-theme-darkgrey mt-1 flex items-center space-x-2">
          <span class="text-emerald-500 font-medium">{{ metrics.jobs.completed }} selesai</span>
          <span>•</span>
          <span class="text-red-500 font-medium">{{ metrics.jobs.failed }} gagal</span>
        </div>
      </div>

      <!-- Card 2: Total AI Tokens -->
      <div class="p-5 rounded-xl bg-white dark:bg-theme-cardDark border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-subtle">
        <div class="flex items-center justify-between text-theme-coolgrey dark:text-theme-darkgrey mb-2">
          <span class="text-xs font-semibold uppercase">Konsumsi Token</span>
          <Cpu class="w-4 h-4 text-purple-500" />
        </div>
        <div class="text-2xl font-bold text-theme-charcoal dark:text-theme-offwhite">
          {{ metrics.jobs.total_tokens.toLocaleString() }}
        </div>
        <p class="text-xs text-theme-coolgrey dark:text-theme-darkgrey mt-1">
          Prompt + Candidate Tokens
        </p>
      </div>

      <!-- Card 3: Average Latency -->
      <div class="p-5 rounded-xl bg-white dark:bg-theme-cardDark border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-subtle">
        <div class="flex items-center justify-between text-theme-coolgrey dark:text-theme-darkgrey mb-2">
          <span class="text-xs font-semibold uppercase">Rata-Rata Latensi</span>
          <Clock class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-2xl font-bold text-theme-charcoal dark:text-theme-offwhite">
          {{ metrics.jobs.avg_latency_ms }} ms
        </div>
        <p class="text-xs text-theme-coolgrey dark:text-theme-darkgrey mt-1">
          Waktu respon generasi AI
        </p>
      </div>

      <!-- Card 4: Users -->
      <div class="p-5 rounded-xl bg-white dark:bg-theme-cardDark border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-subtle">
        <div class="flex items-center justify-between text-theme-coolgrey dark:text-theme-darkgrey mb-2">
          <span class="text-xs font-semibold uppercase">Total Pengguna</span>
          <Users class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-2xl font-bold text-theme-charcoal dark:text-theme-offwhite">
          {{ metrics.users.total }}
        </div>
        <div class="text-xs text-theme-coolgrey dark:text-theme-darkgrey mt-1 flex items-center space-x-2">
          <span>{{ metrics.users.admin }} Admin</span>
          <span>•</span>
          <span>{{ metrics.users.public }} Publik</span>
        </div>
      </div>
    </div>

    <!-- Job Activity Table Section -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-theme-charcoal dark:text-theme-offwhite">
          Log Seluruh Aktivitas Generasi
        </h2>
        <div class="w-full sm:w-72">
          <BaseSearch v-model="search" placeholder="Cari ID, proyek, tipe..." />
        </div>
      </div>

      <div class="bg-white dark:bg-theme-cardDark rounded-xl border border-theme-coolgrey/40 dark:border-theme-borderDark overflow-hidden shadow-subtle">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-theme-coolgrey/10 dark:bg-theme-almostblack border-b border-theme-coolgrey/30 dark:border-theme-borderDark text-xs text-theme-coolgrey dark:text-theme-darkgrey uppercase font-semibold">
              <tr>
                <th class="px-5 py-3.5">ID Pekerjaan</th>
                <th class="px-5 py-3.5">Nama Proyek</th>
                <th class="px-5 py-3.5">Tipe Dokumen</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5">Tokens</th>
                <th class="px-5 py-3.5">Latensi</th>
                <th class="px-5 py-3.5">Dibuat Pada</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme-coolgrey/20 dark:divide-theme-borderDark">
              <tr
                v-for="job in filteredJobs"
                :key="job.id"
                class="hover:bg-theme-coolgrey/5 dark:hover:bg-theme-almostblack/50 transition-colors"
              >
                <!-- Job ID -->
                <td class="px-5 py-3.5 font-mono text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                  {{ job.id.substring(0, 8) }}...
                </td>

                <!-- Project Name -->
                <td class="px-5 py-3.5 font-medium text-theme-charcoal dark:text-theme-offwhite">
                  {{ job.project_name }}
                </td>

                <!-- Document Type -->
                <td class="px-5 py-3.5">
                  <span class="px-2 py-0.5 rounded text-xs font-medium bg-theme-accent/10 dark:bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                    {{ job.document_type }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-5 py-3.5">
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

                <!-- Tokens -->
                <td class="px-5 py-3.5 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                  {{ (job.prompt_tokens || 0) + (job.candidate_tokens || 0) }}
                </td>

                <!-- Latency -->
                <td class="px-5 py-3.5 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                  {{ job.latency_ms || 0 }} ms
                </td>

                <!-- Created At -->
                <td class="px-5 py-3.5 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
                  <div class="flex items-center space-x-1">
                    <Calendar class="w-3.5 h-3.5" />
                    <span>{{ new Date(job.created_at).toLocaleString('id-ID') }}</span>
                  </div>
                </td>

                <!-- Action -->
                <td class="px-5 py-3.5 text-right">
                  <BaseButton variant="secondary" size="sm" @click="openViewer(job)">
                    <Eye class="w-3.5 h-3.5 mr-1" />
                    Inspeksi
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="border-t border-theme-coolgrey/30 dark:border-theme-borderDark">
            <BasePagination
              :current-page="currentPage"
              :total-items="totalJobsCount"
              :page-size="pageSize"
              @update:current-page="onPageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector Modal -->
    <div
      v-if="selectedJob"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-theme-cardDark rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-theme-coolgrey/30 dark:border-theme-borderDark">
          <div>
            <h2 class="text-lg font-bold text-theme-charcoal dark:text-theme-offwhite">
              Inspeksi Dokumen: {{ selectedJob.project_name }}
            </h2>
            <p class="text-xs text-theme-coolgrey dark:text-theme-darkgrey">
              Job ID: {{ selectedJob.id }} • User ID: {{ selectedJob.user_id || 'Public (Guest)' }}
            </p>
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
