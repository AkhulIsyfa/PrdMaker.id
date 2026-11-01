import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.CORS_ORIGIN],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Max 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Terlalu banyak permintaan. Batas maksimal 60 request per menit.',
  },
});

export const generatorRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute for AI generator
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    code: 'GENERATOR_RATE_LIMIT_EXCEEDED',
    message: 'Batas pembuatan dokumen terlampaui. Maksimal 10 dokumen per menit.',
  },
});

