<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useDocumentStore } from '../stores/document';
import BaseButton from '../components/common/BaseButton.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import { Sparkles, Plus, X, Clock, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const documentStore = useDocumentStore();

const projectName = ref('');
const documentType = ref('PRD');
const language = ref<'id' | 'en'>('id');
const description = ref('');
const targetUsers = ref('');
const techStackInput = ref('');
const techStackTags = ref<string[]>(['Vue.js 3', 'Node.js', 'PostgreSQL', 'Docker']);
const customRuleInput = ref('');
const customRules = ref<string[]>(['Clean CSR Architecture', 'Defensive Input Sanitization']);

const activeTab = ref<'form' | 'preview'>('form');
const timer = ref(0);
let timerInterval: any = null;

onMounted(async () => {
  await documentStore.fetchTemplates();
});

const isFormValid = computed(() => {
  return (
    projectName.value.trim().length >= 3 &&
    description.value.trim().length >= 20 &&
    documentType.value
  );
});

const addTechTag = () => {
  const val = techStackInput.value.trim();
  if (val && !techStackTags.value.includes(val)) {
    techStackTags.value.push(val);
    techStackInput.value = '';
  }
};

const removeTechTag = (tag: string) => {
  techStackTags.value = techStackTags.value.filter((t) => t !== tag);
};

const addCustomRule = () => {
  const val = customRuleInput.value.trim();
  if (val && !customRules.value.includes(val)) {
    customRules.value.push(val);
    customRuleInput.value = '';
  }
};

const removeCustomRule = (rule: string) => {
  customRules.value = customRules.value.filter((r) => r !== rule);
};

const startTimer = () => {
  timer.value = 0;
  timerInterval = setInterval(() => {
    timer.value += 100;
  }, 100);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const handleGenerate = async () => {
  if (!isFormValid.value) return;

  startTimer();
  try {
    await documentStore.generateDocument({
      project_name: projectName.value.trim(),
      document_type: documentType.value,
      description: description.value.trim(),
      language: language.value,
      tech_stack: techStackTags.value,
      target_users: targetUsers.value.trim() || undefined,
      custom_rules: customRules.value,
    });
    // On mobile switch to preview automatically
    activeTab.value = 'preview';
  } catch {
    // Handled in store
  } finally {
    stopTimer();
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-theme-coolgrey/40 dark:border-theme-borderDark gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-theme-charcoal dark:text-theme-offwhite">
          Generator Spesifikasi Arsitektur
        </h1>
        <p class="text-sm text-theme-coolgrey dark:text-theme-darkgrey mt-1">
          Kembangkan deskripsi mentah menjadi Product Requirements Document (PRD), Arsitektur CSR, atau Spesifikasi API.
        </p>
      </div>

      <!-- Mobile Tab Switcher -->
      <div class="flex lg:hidden bg-theme-coolgrey/20 dark:bg-theme-almostblack p-1 rounded-lg border border-theme-coolgrey/30 dark:border-theme-borderDark">
        <button
          type="button"
          @click="activeTab = 'form'"
          :class="[
            'flex-1 py-1.5 px-4 rounded-md text-xs font-medium transition-all duration-200',
            activeTab === 'form'
              ? 'bg-white dark:bg-theme-cardDark text-theme-charcoal dark:text-theme-offwhite shadow-subtle'
              : 'text-theme-coolgrey dark:text-theme-darkgrey',
          ]"
        >
          Form Input
        </button>
        <button
          type="button"
          @click="activeTab = 'preview'"
          :class="[
            'flex-1 py-1.5 px-4 rounded-md text-xs font-medium transition-all duration-200',
            activeTab === 'preview'
              ? 'bg-white dark:bg-theme-cardDark text-theme-charcoal dark:text-theme-offwhite shadow-subtle'
              : 'text-theme-coolgrey dark:text-theme-darkgrey',
          ]"
        >
          Hasil Dokumen
        </button>
      </div>
    </div>

    <!-- Main Grid Layout (Split-View on Desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Input Form -->
      <div
        :class="[
          'lg:col-span-5 bg-white dark:bg-theme-cardDark p-6 rounded-xl border border-theme-coolgrey/40 dark:border-theme-borderDark shadow-subtle space-y-5',
          activeTab === 'form' ? 'block' : 'hidden lg:block',
        ]"
      >
        <form @submit.prevent="handleGenerate" class="space-y-4">
          <!-- Project Name -->
          <div>
            <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
              Nama Proyek <span class="text-red-500">*</span>
            </label>
            <input
              v-model="projectName"
              type="text"
              required
              minlength="3"
              maxlength="100"
              class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              placeholder="Contoh: Signet CMS, QuickPay Engine..."
            />
          </div>

          <!-- Document Type & Language Selector Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
                Tipe Dokumen
              </label>
              <select
                v-model="documentType"
                class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              >
                <option value="PRD">PRD (Product Requirements)</option>
                <option value="SYSTEM_ARCHITECTURE">System Architecture (CSR)</option>
                <option value="API_SPEC">RESTful API Specification</option>
                <option value="UI_DESIGN">UI & Design System</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
                Bahasa Dokumen
              </label>
              <select
                v-model="language"
                class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              >
                <option value="id">Bahasa Indonesia (id)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite">
                Deskripsi & Cakupan Proyek <span class="text-red-500">*</span>
              </label>
              <span class="text-[11px] text-theme-coolgrey dark:text-theme-darkgrey">
                {{ description.length }} / 5000
              </span>
            </div>
            <textarea
              v-model="description"
              required
              minlength="20"
              maxlength="5000"
              rows="5"
              class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 resize-y"
              placeholder="Jelaskan kebutuhan, masalah yang diselesaikan, dan alur kerja utama aplikasi secara mendalam (minimal 20 karakter)..."
            ></textarea>
          </div>

          <!-- Tech Stack Tags -->
          <div>
            <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
              Tumpukan Teknologi (Tech Stack)
            </label>
            <div class="flex items-center space-x-2 mb-2">
              <input
                v-model="techStackInput"
                type="text"
                @keydown.enter.prevent="addTechTag"
                placeholder="Tambah teknologi lalu tekan enter..."
                class="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              />
              <BaseButton type="button" size="sm" variant="secondary" @click="addTechTag">
                <Plus class="w-3.5 h-3.5" />
              </BaseButton>
            </div>

            <!-- Tags Container -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in techStackTags"
                :key="tag"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-theme-accent/10 dark:bg-theme-accent/20 text-theme-accent border border-theme-accent/30"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTechTag(tag)"
                  class="ml-1 text-theme-accent hover:text-red-500 focus:outline-none"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Target Users -->
          <div>
            <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
              Target Pengguna / Audiens
            </label>
            <input
              v-model="targetUsers"
              type="text"
              class="w-full px-3 py-2 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              placeholder="Contoh: Administrator, Pelanggan Publik, Tim Teknis"
            />
          </div>

          <!-- Custom Rules -->
          <div>
            <label class="block text-xs font-semibold text-theme-charcoal dark:text-theme-offwhite mb-1">
              Aturan Tambahan / Batasan Arsitektur
            </label>
            <div class="flex items-center space-x-2 mb-2">
              <input
                v-model="customRuleInput"
                type="text"
                @keydown.enter.prevent="addCustomRule"
                placeholder="Aturan khusus (e.g. Strict 3NF, YAGNI)..."
                class="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-theme-almostblack border border-theme-coolgrey dark:border-theme-darkgrey text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
              />
              <BaseButton type="button" size="sm" variant="secondary" @click="addCustomRule">
                <Plus class="w-3.5 h-3.5" />
              </BaseButton>
            </div>

            <div class="space-y-1">
              <div
                v-for="rule in customRules"
                :key="rule"
                class="flex items-center justify-between px-2.5 py-1 rounded bg-theme-coolgrey/10 dark:bg-theme-almostblack border border-theme-coolgrey/20 dark:border-theme-borderDark text-xs text-theme-charcoal dark:text-theme-offwhite"
              >
                <span>{{ rule }}</span>
                <button
                  type="button"
                  @click="removeCustomRule(rule)"
                  class="text-theme-coolgrey hover:text-red-500"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Error Feedback -->
          <div
            v-if="documentStore.generationError"
            class="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start space-x-2 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ documentStore.generationError }}</span>
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            variant="primary"
            class="w-full py-2.5 mt-2"
            :disabled="!isFormValid || documentStore.isGenerating"
            :loading="documentStore.isGenerating"
          >
            <Sparkles class="w-4 h-4 mr-2" />
            {{ documentStore.isGenerating ? `Menghasilkan Dokumen (${(timer / 1000).toFixed(1)}s)...` : 'Hasilkan Dokumen' }}
          </BaseButton>
        </form>
      </div>

      <!-- Right Column: Markdown Output / Viewer -->
      <div
        :class="[
          'lg:col-span-7 flex flex-col space-y-4',
          activeTab === 'preview' ? 'block' : 'hidden lg:block',
        ]"
      >
        <!-- Generation Status Metrics Header -->
        <div
          v-if="documentStore.currentJob"
          class="flex flex-wrap items-center justify-between p-3.5 rounded-lg bg-theme-coolgrey/10 dark:bg-theme-almostblack border border-theme-coolgrey/30 dark:border-theme-borderDark text-xs gap-2"
        >
          <div class="flex items-center space-x-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <span class="font-semibold text-theme-charcoal dark:text-theme-offwhite">
              Status: {{ documentStore.currentJob.status }}
            </span>
          </div>

          <div
            v-if="documentStore.currentJob.metadata"
            class="flex items-center space-x-4 text-theme-coolgrey dark:text-theme-darkgrey"
          >
            <div class="flex items-center space-x-1">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ documentStore.currentJob.metadata.latency_ms || 0 }}ms</span>
            </div>
            <div>
              <span>Tokens: </span>
              <span class="font-medium text-theme-charcoal dark:text-theme-offwhite">
                {{ (documentStore.currentJob.metadata.prompt_tokens || 0) + (documentStore.currentJob.metadata.candidate_tokens || 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Markdown Viewer Component -->
        <MarkdownViewer
          :content="documentStore.currentJob?.content || documentStore.currentJob?.generated_content || ''"
          :project-name="documentStore.currentJob?.project_name || projectName || 'MakePRD'"
          :document-type="documentStore.currentJob?.document_type || documentType"
        />
      </div>
    </div>
  </div>
</template>
