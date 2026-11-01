import { generationJobRepository } from '../repositories/GenerationJobRepository.js';
import { documentTemplateRepository } from '../repositories/DocumentTemplateRepository.js';
import { aiOrchestratorService } from './AiOrchestratorService.js';
import type {
  CreateDocumentJobDTO,
  GenerationJobEntity,
} from '../models/document.dto.js';

export class DocumentJobService {
  async createAndGenerate(
    userId: string | null,
    dto: CreateDocumentJobDTO
  ): Promise<GenerationJobEntity> {
    // 1. Initialize Job in PostgreSQL with PENDING status
    const job = await generationJobRepository.create({
      user_id: userId,
      project_name: dto.project_name,
      document_type: dto.document_type,
      language: dto.language,
      input_payload: dto,
    });

    // 2. Transition status to PROCESSING
    await generationJobRepository.updateStatus(job.id, 'PROCESSING');

    try {
      // 3. Dispatch to AI Engine Pipeline
      const aiResult = await aiOrchestratorService.generateDocument(dto);

      // 4. Update Job to COMPLETED with content and metrics
      const completedJob = await generationJobRepository.updateStatus(job.id, 'COMPLETED', {
        generated_content: aiResult.content,
        prompt_tokens: aiResult.promptTokens,
        candidate_tokens: aiResult.candidateTokens,
        latency_ms: aiResult.latencyMs,
      });

      return completedJob || job;
    } catch (err: any) {
      // 5. Update Job to FAILED if generation encountered unrecoverable error
      await generationJobRepository.updateStatus(job.id, 'FAILED', {
        error_message: err.message || 'Generation error',
      });
      throw err;
    }
  }

  async getJobById(
    jobId: string,
    currentUserId?: string,
    userRole?: string
  ): Promise<GenerationJobEntity> {
    const job = await generationJobRepository.findById(jobId);
    if (!job) {
      const error: any = new Error('Pekerjaan dokumen tidak ditemukan.');
      error.statusCode = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    // Role check: If job belongs to a specific user and requester is not Admin nor the owner
    if (job.user_id && userRole !== 'ADMIN' && job.user_id !== currentUserId) {
      const error: any = new Error('Akses ditolak ke pekerjaan dokumen ini.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return job;
  }

  async listTemplates(): Promise<Array<{
    id: string;
    document_type: string;
    supported_languages: string[];
    is_active: boolean;
  }>> {
    const templates = await documentTemplateRepository.listActive();
    return templates.map((t) => ({
      id: t.template_key,
      document_type: t.document_type,
      supported_languages: t.supported_languages,
      is_active: t.is_active,
    }));
  }

  async listUserJobs(userId: string, limit = 20, offset = 0) {
    return await generationJobRepository.listJobs({ userId, limit, offset });
  }

  async listAllJobs(limit = 50, offset = 0) {
    return await generationJobRepository.listJobs({ limit, offset });
  }
}

export const documentJobService = new DocumentJobService();

