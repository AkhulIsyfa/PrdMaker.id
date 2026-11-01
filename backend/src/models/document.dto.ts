import { z } from 'zod';

export const DocumentTypeEnum = z.enum([
  'PRD',
  'SYSTEM_ARCHITECTURE',
  'API_SPEC',
  'UI_DESIGN',
]);

export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const DocumentLanguageEnum = z.enum(['id', 'en']);
export type DocumentLanguage = z.infer<typeof DocumentLanguageEnum>;

export const JobStatusEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export interface DocumentTemplateEntity {
  id: string;
  template_key: string;
  document_type: DocumentType;
  system_instruction: string;
  schema_template: string;
  supported_languages: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GenerationJobEntity {
  id: string;
  user_id: string | null;
  project_name: string;
  document_type: DocumentType;
  language: DocumentLanguage;
  input_payload: Record<string, any>;
  status: JobStatus;
  generated_content: string | null;
  error_message: string | null;
  prompt_tokens: number;
  candidate_tokens: number;
  latency_ms: number;
  created_at: Date;
  updated_at: Date;
}

export const CreateDocumentJobSchema = z.object({
  project_name: z
    .string()
    .trim()
    .min(3, 'Nama proyek minimal 3 karakter')
    .max(100, 'Nama proyek maksimal 100 karakter'),
  document_type: DocumentTypeEnum,
  description: z
    .string()
    .trim()
    .min(20, 'Deskripsi cakupan proyek minimal 20 karakter')
    .max(5000, 'Deskripsi cakupan proyek maksimal 5000 karakter'),
  language: DocumentLanguageEnum.default('id'),
  tech_stack: z
    .union([z.string().trim().min(1), z.array(z.string().trim().min(1))])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return val;
    }),
  target_users: z.string().trim().optional().default('End users and software developers'),
  custom_rules: z.array(z.string().trim()).optional().default([]),
});

export type CreateDocumentJobDTO = z.infer<typeof CreateDocumentJobSchema>;

export const JobIdParamSchema = z.object({
  job_id: z.string().uuid('ID pekerjaan harus berupa UUID valid'),
});

export type JobIdParamDTO = z.infer<typeof JobIdParamSchema>;

