import { defineStore } from 'pinia';
import { ref } from 'vue';
import { documentApi } from '../api/client';

export interface DocumentTemplate {
  id: string;
  document_type: string;
  supported_languages: string[];
  is_active: boolean;
}

export interface DocumentJob {
  job_id: string;
  project_name?: string;
  document_type: string;
  language: string;
  status: string;
  content?: string;
  generated_content?: string;
  metadata?: {
    created_at?: string;
    prompt_tokens?: number;
    candidate_tokens?: number;
    latency_ms?: number;
    error_message?: string;
  };
  created_at?: string;
}

export const useDocumentStore = defineStore('document', () => {
  const templates = ref<DocumentTemplate[]>([]);
  const currentJob = ref<DocumentJob | null>(null);
  const isGenerating = ref<boolean>(false);
  const generationError = ref<string | null>(null);
  const userJobs = ref<any[]>([]);
  const totalUserJobs = ref<number>(0);

  const fetchTemplates = async () => {
    try {
      const res = await documentApi.getTemplates();
      templates.value = res.data.templates || [];
    } catch (err: any) {
      console.error('Failed to load document templates', err);
    }
  };

  const generateDocument = async (payload: {
    project_name: string;
    document_type: string;
    description: string;
    language?: 'id' | 'en';
    tech_stack?: string[];
    target_users?: string;
    custom_rules?: string[];
  }) => {
    isGenerating.value = true;
    generationError.value = null;
    try {
      const res = await documentApi.generateDocument(payload);
      currentJob.value = res.data;
      return res.data;
    } catch (err: any) {
      generationError.value = err.message || 'Gagal menghasilkan dokumen';
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  const fetchJobById = async (jobId: string) => {
    try {
      const res = await documentApi.getJobStatus(jobId);
      currentJob.value = res.data;
      return res.data;
    } catch (err: any) {
      console.error(`Failed to fetch job ${jobId}`, err);
      throw err;
    }
  };

  const fetchMyJobs = async (page = 1, limit = 10) => {
    try {
      const offset = (page - 1) * limit;
      const res = await documentApi.getMyJobs({ limit, offset });
      userJobs.value = res.data.data;
      totalUserJobs.value = res.data.meta.total;
    } catch (err: any) {
      console.error('Failed to fetch user jobs', err);
    }
  };

  return {
    templates,
    currentJob,
    isGenerating,
    generationError,
    userJobs,
    totalUserJobs,
    fetchTemplates,
    generateDocument,
    fetchJobById,
    fetchMyJobs,
  };
});

