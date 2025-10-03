import type { ApiResponse } from '../models/index.js';
export const parseApiResponse = <T>(data: T, message = 'Request successful'): ApiResponse<T> => ({
  data,
  message,
  success: true,
  timestamp: new Date().toISOString(),
});
