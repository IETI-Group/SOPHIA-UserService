export default interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  stack?: string;
}
