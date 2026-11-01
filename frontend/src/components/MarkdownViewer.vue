<script setup lang="ts">
import { ref, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { Copy, Check, Download, FileText } from 'lucide-vue-next';
import BaseButton from './common/BaseButton.vue';

interface Props {
  content: string;
  projectName?: string;
  documentType?: string;
  showToolbar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  projectName: 'Dokumen',
  documentType: 'SPEC',
  showToolbar: true,
});

const copied = ref(false);

const md = new MarkdownIt({
  html: false, // Disallow raw HTML from input for extra security
  xhtmlOut: false,
  breaks: true,
  linkify: true,
  typographer: true,
});

// Render and sanitize markdown
const sanitizedHtml = computed(() => {
  if (!props.content) return '';
  const rawHtml = md.render(props.content);
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
});

const wordCount = computed(() => {
  if (!props.content) return 0;
  return props.content.trim().split(/\s+/).filter(Boolean).length;
});

const handleCopy = async () => {
  if (!props.content) return;
  try {
    await navigator.clipboard.writeText(props.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy content to clipboard', err);
  }
};

const handleDownload = () => {
  if (!props.content) return;
  const fileName = `${props.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${props.documentType.toLowerCase()}.md`;
  const blob = new Blob([props.content], { type: 'text/markdown;charset=utf-8;' });
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
  <div class="flex flex-col h-full bg-white dark:bg-theme-cardDark rounded-lg border border-theme-coolgrey/40 dark:border-theme-borderDark overflow-hidden shadow-subtle">
    <!-- Top Action Toolbar -->
    <div
      v-if="showToolbar"
      class="flex flex-wrap items-center justify-between px-4 py-2.5 bg-theme-coolgrey/10 dark:bg-theme-almostblack border-b border-theme-coolgrey/30 dark:border-theme-borderDark gap-2"
    >
      <div class="flex items-center space-x-2 text-xs text-theme-coolgrey dark:text-theme-darkgrey">
        <FileText class="w-4 h-4 text-theme-accent" />
        <span class="font-medium text-theme-charcoal dark:text-theme-offwhite">
          {{ projectName }} ({{ documentType }})
        </span>
        <span>•</span>
        <span>{{ wordCount }} kata</span>
        <span>•</span>
        <span>{{ content.length }} karakter</span>
      </div>

      <div class="flex items-center space-x-2">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="handleCopy"
          :title="copied ? 'Tersalin' : 'Salin Markdown'"
        >
          <Check v-if="copied" class="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          <Copy v-else class="w-3.5 h-3.5 mr-1.5" />
          {{ copied ? 'Disalin!' : 'Salin' }}
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          @click="handleDownload"
          title="Unduh berkas .md"
        >
          <Download class="w-3.5 h-3.5 mr-1.5" />
          Unduh .md
        </BaseButton>
      </div>
    </div>

    <!-- Rendered Markdown Body -->
    <div class="flex-1 p-6 overflow-y-auto max-h-[750px]">
      <div
        v-if="content"
        class="markdown-content text-theme-charcoal dark:text-theme-offwhite space-y-4"
        v-html="sanitizedHtml"
      ></div>

      <div
        v-else
        class="h-64 flex flex-col items-center justify-center text-center text-theme-coolgrey dark:text-theme-darkgrey space-y-2"
      >
        <FileText class="w-10 h-10 opacity-30" />
        <p class="text-sm">Dokumen yang dihasilkan akan ditampilkan di sini.</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Scoped-like typography styling for sanitized markdown output */
.markdown-content h1 {
  font-size: 28px;
  font-weight: 700;
  border-bottom: 1px solid rgba(156, 163, 175, 0.2);
  padding-bottom: 0.3em;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}

.markdown-content h2 {
  font-size: 22px;
  font-weight: 600;
  border-bottom: 1px solid rgba(156, 163, 175, 0.15);
  padding-bottom: 0.3em;
  margin-top: 1.1em;
  margin-bottom: 0.5em;
}

.markdown-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.4em;
}

.markdown-content p {
  margin-bottom: 0.8em;
  line-height: 1.65;
}

.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 0.8em;
}

.markdown-content ol {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin-bottom: 0.8em;
}

.markdown-content li {
  margin-bottom: 0.25em;
}

.markdown-content code {
  background-color: rgba(156, 163, 175, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 85%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.markdown-content pre {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  font-size: 85%;
  color: inherit;
}

.markdown-content blockquote {
  border-left: 4px solid #2563eb;
  padding-left: 1em;
  margin-left: 0;
  margin-bottom: 0.8em;
  color: #64748b;
  font-style: italic;
}

.dark .markdown-content blockquote {
  color: #94a3b8;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid rgba(156, 163, 175, 0.3);
  padding: 8px 12px;
  text-align: left;
}

.markdown-content th {
  background-color: rgba(156, 163, 175, 0.1);
  font-weight: 600;
}
</style>
