import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Success response - use this for all successful API calls
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Error response - standardized error handling
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return NextResponse.json(response, { status });
}

/**
 * Validation error response - for Zod validation failures
 */
export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const fieldErrors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return errorResponse("Validation failed", 400, fieldErrors);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", 403);
}

/**
 * Not found response
 */
export function notFoundResponse(): NextResponse<ApiResponse> {
  return errorResponse("Not found", 404);
}
