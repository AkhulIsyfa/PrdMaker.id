import { Router } from 'express';
import { adminController } from '../controllers/AdminController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Apply Admin Guard to all admin routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// 1. List all system generation jobs with pagination
router.get('/jobs', adminController.listJobs.bind(adminController));

// 2. Aggregate system metrics
router.get('/metrics', adminController.getMetrics.bind(adminController));

export default router;

