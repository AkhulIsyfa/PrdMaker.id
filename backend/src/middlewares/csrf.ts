import type { Request, Response, NextFunction } from 'express';
import { generateCsrfToken } from '../utils/crypto.js';

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Safe methods do not require CSRF token
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.['csrf-token'];

  // If CSRF cookie is set, verify against header
  if (cookieToken && clientToken !== cookieToken) {
    res.status(403).json({
      status: 'ERROR',
      code: 'CSRF_INVALID',
      message: 'Token CSRF tidak valid atau tidak cocok.',
    });
    return;
  }

  next();
};

export const issueCsrfToken = (_req: Request, res: Response): void => {
  const token = generateCsrfToken();
  res.cookie('csrf-token', token, {
    httpOnly: false, // Accessible by JavaScript on the frontend to set header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.json({
    status: 'OK',
    csrf_token: token,
  });
};

