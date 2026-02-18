export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public isRecoverable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode?: number, public endpoint?: string) {
    super(message, 'API_ERROR', statusCode, statusCode !== undefined && statusCode < 500);
    this.name = 'ApiError';
  }
}

export class SSEError extends AppError {
  constructor(message: string) {
    super(message, 'SSE_ERROR', undefined, true);
    this.name = 'SSEError';
  }
}