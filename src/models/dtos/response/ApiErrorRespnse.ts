interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  stack?: string;
}

export type { ApiErrorResponse };
export default ApiErrorResponse;
