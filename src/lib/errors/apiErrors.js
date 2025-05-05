// /lib/errors/apiErrors.js

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(message, statusCode = 500, additionalInfo = {}) {
      super(message);
      this.statusCode = statusCode;
      this.additionalInfo = additionalInfo;
      this.name = 'ApiError';
    }
    
    /**
     * Create an error response object
     * @returns {Object} Error response object
     */
    toResponseObject() {
      return {
        error: this.message,
        statusCode: this.statusCode,
        ...(Object.keys(this.additionalInfo).length > 0 ? { details: this.additionalInfo } : {})
      };
    }
    
    /**
     * Convert the error to a Next.js response
     * @returns {Response} Next.js response
     */
    toResponse() {
      return new Response(
        JSON.stringify(this.toResponseObject()),
        {
          status: this.statusCode,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
  
  /**
   * Not found error (404)
   */
  export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', additionalInfo = {}) {
      super(message, 404, additionalInfo);
      this.name = 'NotFoundError';
    }
  }
  
  /**
   * Unauthorized error (401)
   */
  export class UnauthorizedError extends ApiError {
    constructor(message = 'Authentication required', additionalInfo = {}) {
      super(message, 401, additionalInfo);
      this.name = 'UnauthorizedError';
    }
  }
  
  /**
   * Forbidden error (403)
   */
  export class ForbiddenError extends ApiError {
    constructor(message = 'Permission denied', additionalInfo = {}) {
      super(message, 403, additionalInfo);
      this.name = 'ForbiddenError';
    }
  }
  
  /**
   * Bad request error (400)
   */
  export class BadRequestError extends ApiError {
    constructor(message = 'Invalid request', additionalInfo = {}) {
      super(message, 400, additionalInfo);
      this.name = 'BadRequestError';
    }
  }