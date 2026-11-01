import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token and CSRF Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('makeprd_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  // Get CSRF token from cookie if available
  const csrfMatch = document.cookie.match(/csrf-token=([^;]+)/);
  if (csrfMatch && csrfMatch[1]) {
    config.headers.set('X-CSRF-Token', csrfMatch[1]);
  }

  return config;
});

// Response Interceptor: Format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.message || error.message || 'Terjadi kesalahan pada jaringan.';
    return Promise.reject(new Error(errorMessage));
  }
);

// API Service Call Helpers
export const authApi = {
  getCsrfToken: () => apiClient.get('/auth/csrf-token'),
  register: (payload: { email: string; password: string; full_name: string }) =>
    apiClient.post('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    apiClient.post('/auth/login', payload),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

export const documentApi = {
  getTemplates: () => apiClient.get('/documents/templates'),
  generateDocument: (payload: {
    project_name: string;
    document_type: string;
    description: string;
    language?: 'id' | 'en';
    tech_stack?: string[];
    target_users?: string;
    custom_rules?: string[];
  }) => apiClient.post('/documents/generate', payload),
  getJobStatus: (jobId: string) => apiClient.get(`/documents/jobs/${jobId}`),
  getMyJobs: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/documents/my-jobs', { params }),
};

export const adminApi = {
  getJobs: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/admin/jobs', { params }),
  getMetrics: () => apiClient.get('/admin/metrics'),
};

