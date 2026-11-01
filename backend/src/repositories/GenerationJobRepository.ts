import { query } from '../config/database.js';
import type {
  GenerationJobEntity,
  JobStatus,
  DocumentType,
  DocumentLanguage,
} from '../models/document.dto.js';

export class GenerationJobRepository {
  async create(data: {
    user_id?: string | null;
    project_name: string;
    document_type: DocumentType;
    language: DocumentLanguage;
    input_payload: Record<string, any>;
  }): Promise<GenerationJobEntity> {
    const sql = `
      INSERT INTO generation_jobs (
        user_id, project_name, document_type, language, input_payload, status
      )
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING 
        id, user_id, project_name, document_type, language, input_payload, 
        status, generated_content, error_message, prompt_tokens, candidate_tokens, 
        latency_ms, created_at, updated_at;
    `;
    const values = [
      data.user_id || null,
      data.project_name,
      data.document_type,
      data.language,
      JSON.stringify(data.input_payload),
    ];
    const res = await query<GenerationJobEntity>(sql, values);
    return res.rows[0];
  }

  async findById(id: string): Promise<GenerationJobEntity | null> {
    const sql = `
      SELECT 
        id, user_id, project_name, document_type, language, input_payload, 
        status, generated_content, error_message, prompt_tokens, candidate_tokens, 
        latency_ms, created_at, updated_at
      FROM generation_jobs
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await query<GenerationJobEntity>(sql, [id]);
    return res.rows[0] || null;
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    updates: {
      generated_content?: string | null;
      error_message?: string | null;
      prompt_tokens?: number;
      candidate_tokens?: number;
      latency_ms?: number;
    } = {}
  ): Promise<GenerationJobEntity | null> {
    const sql = `
      UPDATE generation_jobs
      SET 
        status = $1,
        generated_content = COALESCE($2, generated_content),
        error_message = COALESCE($3, error_message),
        prompt_tokens = COALESCE($4, prompt_tokens),
        candidate_tokens = COALESCE($5, candidate_tokens),
        latency_ms = COALESCE($6, latency_ms),
        updated_at = NOW()
      WHERE id = $7
      RETURNING 
        id, user_id, project_name, document_type, language, input_payload, 
        status, generated_content, error_message, prompt_tokens, candidate_tokens, 
        latency_ms, created_at, updated_at;
    `;
    const values = [
      status,
      updates.generated_content ?? null,
      updates.error_message ?? null,
      updates.prompt_tokens ?? null,
      updates.candidate_tokens ?? null,
      updates.latency_ms ?? null,
      id,
    ];
    const res = await query<GenerationJobEntity>(sql, values);
    return res.rows[0] || null;
  }

  async listJobs(options: {
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ jobs: GenerationJobEntity[]; total: number }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    let whereClause = '';
    const params: any[] = [];

    if (options.userId) {
      whereClause = 'WHERE user_id = $1';
      params.push(options.userId);
    }

    const countSql = `SELECT COUNT(*) as count FROM generation_jobs ${whereClause};`;
    const countRes = await query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const listSql = `
      SELECT 
        id, user_id, project_name, document_type, language, input_payload, 
        status, generated_content, error_message, prompt_tokens, candidate_tokens, 
        latency_ms, created_at, updated_at
      FROM generation_jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    const listRes = await query<GenerationJobEntity>(listSql, [...params, limit, offset]);

    return {
      jobs: listRes.rows,
      total,
    };
  }
}

export const generationJobRepository = new GenerationJobRepository();

