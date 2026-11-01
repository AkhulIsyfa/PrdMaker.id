import type { Request, Response, NextFunction } from 'express';
import { documentJobService } from '../services/DocumentJobService.js';
import { query } from '../config/database.js';

export class AdminController {
  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;
      const result = await documentJobService.listAllJobs(limit, offset);

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

  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sqlMetrics = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_jobs,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_jobs,
          COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing_jobs,
          COALESCE(SUM(prompt_tokens + candidate_tokens), 0) as total_tokens,
          COALESCE(ROUND(AVG(latency_ms)), 0) as avg_latency_ms
        FROM generation_jobs;
      `;
      const resMetrics = await query(sqlMetrics);
      const metrics = resMetrics.rows[0];

      const sqlUsers = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'PUBLIC' THEN 1 END) as public_users
        FROM users;
      `;
      const resUsers = await query(sqlUsers);
      const userMetrics = resUsers.rows[0];

      res.status(200).json({
        status: 'SUCCESS',
        data: {
          jobs: {
            total: parseInt(metrics.total_jobs, 10),
            completed: parseInt(metrics.completed_jobs, 10),
            failed: parseInt(metrics.failed_jobs, 10),
            processing: parseInt(metrics.processing_jobs, 10),
            total_tokens: parseInt(metrics.total_tokens, 10),
            avg_latency_ms: parseInt(metrics.avg_latency_ms, 10),
          },
          users: {
            total: parseInt(userMetrics.total_users, 10),
            admin: parseInt(userMetrics.admin_users, 10),
            public: parseInt(userMetrics.public_users, 10),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
