import express from 'express';
import cookieParser from 'cookie-parser';
import {
  helmetMiddleware,
  corsMiddleware,
  globalRateLimiter,
} from './middlewares/security.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Strict Body Parser Limit (Max 100kb)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Global Rate Limiting (60 requests/minute)
app.use(globalRateLimiter);

// Health Check Endpoint
app.get('/health', (_req, expressRes) => {
  expressRes.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MakePRD API Engine',
  });
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
