export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: Record<string, any>;
}

export const createSuccessResponse = <T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
});

export const createErrorResponse = (message: string, errors?: any[], meta?: Record<string, any>): ApiResponse => ({
  success: false,
  message,
  errors,
  meta,
});

