import { z } from 'zod';

export const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';

export interface FieldError {
  readonly path: string;
  readonly code: string;
}

interface ApiErrorDetails {
  code: string;
  status: number;
  fieldErrors?: readonly FieldError[];
  traceId?: string;
  retryAfterSeconds?: number;
}

/**
 * Error de la API (RFC 9457). El mensaje es solo el `code`: nunca incluye el cuerpo de la
 * petición ni de la respuesta, para que ningún log o reporte pueda filtrar datos personales.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: readonly FieldError[];
  readonly traceId: string | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor(details: ApiErrorDetails) {
    super(details.code);
    this.name = 'ApiError';
    this.code = details.code;
    this.status = details.status;
    this.fieldErrors = details.fieldErrors ?? [];
    this.traceId = details.traceId;
    this.retryAfterSeconds = details.retryAfterSeconds;
  }
}

export type NetworkFailureReason = 'offline' | 'timeout';

export class NetworkError extends Error {
  readonly reason: NetworkFailureReason;

  constructor(reason: NetworkFailureReason) {
    super(reason);
    this.name = 'NetworkError';
    this.reason = reason;
  }
}

const problemDetailsSchema = z.object({
  code: z.string().min(1),
  traceId: z.string().optional(),
  errors: z.array(z.object({ path: z.string(), code: z.string() })).optional(),
});

interface ParseProblemInput {
  status: number;
  body: unknown;
  retryAfterHeader?: string | null;
}

function parseRetryAfterSeconds(retryAfterHeader: string | null | undefined): number | undefined {
  if (retryAfterHeader === null || retryAfterHeader === undefined) return undefined;
  const seconds = Number(retryAfterHeader);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

/** Convierte la respuesta de error en `ApiError`; si no es problem+json usa un código genérico. */
export function parseApiError({ status, body, retryAfterHeader }: ParseProblemInput): ApiError {
  const retryAfterSeconds = parseRetryAfterSeconds(retryAfterHeader);
  const parsedProblem = problemDetailsSchema.safeParse(body);
  if (!parsedProblem.success) {
    return new ApiError({
      code: UNKNOWN_ERROR_CODE,
      status,
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    });
  }
  const { code, traceId, errors } = parsedProblem.data;
  return new ApiError({
    code,
    status,
    fieldErrors: errors ?? [],
    ...(traceId === undefined ? {} : { traceId }),
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
