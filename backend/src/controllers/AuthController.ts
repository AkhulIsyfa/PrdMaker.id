import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService.js';
import { env } from '../config/env.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Registrasi berhasil.',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'SUCCESS',
        message: 'Login berhasil.',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'ERROR',
          code: 'UNAUTHORIZED',
          message: 'Sesi tidak ditemukan.',
        });
        return;
      }

      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({
        status: 'SUCCESS',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.status(200).json({
      status: 'SUCCESS',
      message: 'Logout berhasil.',
    });
  }
}

export const authController = new AuthController();

