import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Application Error:', err);

  // Syntax error (e.g. invalid JSON payload from body-parser)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      status: 'ERROR',
      code: 'BAD_REQUEST',
      message: 'Format JSON payload tidak valid.',
    });
    return;
  }

  // Payload Too Large (> 100kb)
  if (err.type === 'entity.too.large') {
    res.status(413).json({
      status: 'ERROR',
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Ukuran payload melebihi batas maksimal 100kb.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan internal pada server.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'ERROR',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

