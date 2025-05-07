// src/lib/errors/appErrors.js
/**
 * Base application error
 */
export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
      super(message);
      this.name = this.constructor.name;
      this.code = code;
      this.statusCode = statusCode;
    }
  }
  
  /**
   * Authentication errors
   */
  export class AuthError extends AppError {
    constructor(message = 'Authentication required', code = 'AUTH_REQUIRED') {
      super(message, code, 401);
    }
  }
  
  /**
   * Permission errors
   */
  export class PermissionError extends AppError {
    constructor(message = 'Permission denied', code = 'PERMISSION_DENIED') {
      super(message, code, 403);
    }
  }
  
  /**
   * Not found errors
   */
  export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
      super(message, code, 404);
    }
  }
  
  /**
   * Validation errors
   */
  export class ValidationError extends AppError {
    constructor(message = 'Validation failed', code = 'VALIDATION_FAILED', errors = {}) {
      super(message, code, 400);
      this.errors = errors;
    }
  }