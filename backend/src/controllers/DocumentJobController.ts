import type { Request, Response, NextFunction } from 'express';
import { documentJobService } from '../services/DocumentJobService.js';

export class DocumentJobController {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || null;
      const job = await documentJobService.createAndGenerate(userId, req.body);

      // Follow exact response structure from api_specification.md
      res.status(200).json({
        job_id: job.id,
        document_type: job.document_type,
        language: job.language,
        status: job.status,
        content: job.generated_content,
        metadata: {
          created_at: job.created_at,
          prompt_tokens: job.prompt_tokens,
          candidate_tokens: job.candidate_tokens,
          latency_ms: job.latency_ms,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { job_id } = req.params;
      const job = await documentJobService.getJobById(
        job_id,
        req.user?.userId,
        req.user?.role
      );

      res.status(200).json({
        job_id: job.id,
        status: job.status,
        project_name: job.project_name,
        document_type: job.document_type,
        language: job.language,
        generated_content: job.generated_content,
        created_at: job.created_at,
        metadata: {
          prompt_tokens: job.prompt_tokens,
          candidate_tokens: job.candidate_tokens,
          latency_ms: job.latency_ms,
          error_message: job.error_message,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async listTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await documentJobService.listTemplates();
      res.status(200).json({
        templates,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          status: 'ERROR',
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan.',
        });
        return;
      }

      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;
      const result = await documentJobService.listUserJobs(userId, limit, offset);

      res.status(200).json({
        status: 'SUCCESS',
        data: result.jobs,
        meta: {
          total: result.total,
          limit,
          offset,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const documentJobController = new DocumentJobController();

