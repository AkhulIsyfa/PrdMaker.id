import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/crypto.js';
import type { UserRole } from '../models/user.dto.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

  if (!token) {
    res.status(401).json({
      status: 'ERROR',
      code: 'UNAUTHORIZED',
      message: 'Autentikasi diperlukan. Token tidak ditemukan.',
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'ERROR',
      code: 'TOKEN_INVALID',
      message: 'Token tidak valid atau telah kedaluwarsa.',
    });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'ERROR',
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Sesi tidak ditemukan.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'ERROR',
        code: 'FORBIDDEN',
        message: 'Hak akses tidak mencukupi untuk aksi ini.',
      });
      return;
    }

    next();
  };
};

