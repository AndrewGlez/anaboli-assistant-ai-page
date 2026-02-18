export class AppError extends Error {
  code: string;
  statusCode?: number;
  isRecoverable: boolean;
  
  constructor(
    message: string,
    code: string,
    statusCode?: number,
    isRecoverable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRecoverable = isRecoverable;
  }
}

export class ApiError extends AppError {
  endpoint?: string;
  
  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string
  ) {
    super(message, 'API_ERROR', statusCode, statusCode !== undefined && statusCode < 500);
    this.name = 'ApiError';
    this.endpoint = endpoint;
  }
}

export class SSEError extends AppError {
  constructor(message: string) {
    super(message, 'SSE_ERROR', undefined, true);
    this.name = 'SSEError';
  }
}
