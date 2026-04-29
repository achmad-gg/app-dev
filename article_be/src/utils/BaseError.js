// src/utils/BaseError.js

/**
 * Custom error class for consistent API error responses.
 * Extends native Error to include HTTP status codes and structured details.
 *
 * Usage:
 *   throw new BaseError('Not Found', 404);
 *   throw new BaseError('Validation failed', 422, [{ field: 'title', message: 'Too short' }]);
 */
export class BaseError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'BaseError';
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    const obj = {
      message: this.message,
      statusCode: this.statusCode,
    };
    if (this.details) {
      obj.details = this.details;
    }
    return obj;
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends BaseError {
  constructor(details = []) {
    super('Validation failed', 422, details);
    this.name = 'ValidationError';
  }
}
