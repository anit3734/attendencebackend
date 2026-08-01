import { HTTP_STATUS, HttpStatusCode } from "@/constants/http-status";

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errors: Record<string, unknown> | Array<unknown> | string | null;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors: Record<string, unknown> | Array<unknown> | string | null = null,
    isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized Access", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access Forbidden", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.FORBIDDEN, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource Not Found", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.NOT_FOUND, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource Conflict", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.CONFLICT, errors);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Failed", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", errors: Record<string, unknown> | Array<unknown> | string | null = null) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errors, false);
  }
}
