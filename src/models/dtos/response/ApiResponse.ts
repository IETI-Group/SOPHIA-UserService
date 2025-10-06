interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export type { ApiResponse };
export default ApiResponse;
