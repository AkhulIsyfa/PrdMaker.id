import { Router } from 'express';
import { documentJobController } from '../controllers/DocumentJobController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  CreateDocumentJobSchema,
  JobIdParamSchema,
} from '../models/document.dto.js';
import { generatorRateLimiter } from '../middlewares/security.js';
import { optionalAuth, authenticateToken } from '../middlewares/auth.js';
import { csrfProtection } from '../middlewares/csrf.js';

const router = Router();

// 1. Get List of Available Document Templates
router.get(
  '/templates',
  documentJobController.listTemplates.bind(documentJobController)
);

// 2. Generate New Document Job (with 10 req/min rate limit & optional auth)
router.post(
  '/generate',
  generatorRateLimiter,
  csrfProtection,
  optionalAuth,
  validateRequest({ body: CreateDocumentJobSchema }),
  documentJobController.generate.bind(documentJobController)
);

// 3. Get User's Personal Document History
router.get(
  '/my-jobs',
  authenticateToken,
  documentJobController.getMyJobs.bind(documentJobController)
);

// 4. Get Job Status and Generated Content by ID
router.get(
  '/jobs/:job_id',
  optionalAuth,
  validateRequest({ params: JobIdParamSchema }),
  documentJobController.getJobStatus.bind(documentJobController)
);

export default router;

