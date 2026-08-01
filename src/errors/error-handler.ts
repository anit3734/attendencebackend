import { NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { AppError } from "@/errors/app-error";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import { logger } from "@/lib/logger";

export function handleApiError(error: unknown): NextResponse {
  logger.error({ error }, "API Route Error Exception");

  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue: ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return ResponseHelper.error(
      "Validation Error",
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      formattedErrors
    );
  }

  if (error instanceof AppError) {
    return ResponseHelper.error(
      error.message,
      error.statusCode,
      error.errors
    );
  }

  // Handle Mongoose duplicate key error (11000)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern || {};
    const field = Object.keys(keyPattern)[0] || "field";
    return ResponseHelper.error(
      `Duplicate entry for field '${field}'`,
      HTTP_STATUS.CONFLICT,
      { field, message: `${field} already exists` }
    );
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return ResponseHelper.error(
    process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    {}
  );
}

export function catchAsync<TParams = Record<string, string>>(
  handler: (req: Request, context: { params: Promise<TParams> }) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: Promise<TParams> }): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
