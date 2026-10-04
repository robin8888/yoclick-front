import { ApiError } from '@/shared/api/api-error';
import { apiMutator } from '@/shared/api/api-mutator';

type ApiCallHandler = (request: { path: string; body: unknown }) => unknown;

interface ApiCall {
  method: string;
  path: string;
  body: unknown;
}

const recordedCalls: ApiCall[] = [];

/** Un fallo RFC 9457 como el que lanzaría el cliente real (`ApiError`). */
export function buildApiError(code: string, status: number): ApiError {
  return new ApiError({ code, status });
}

function parseRequestBody(rawBody: BodyInit | null | undefined): unknown {
  return typeof rawBody === 'string' ? (JSON.parse(rawBody) as unknown) : undefined;
}

/**
 * Sustituye `apiMutator` (por donde pasan todas las funciones generadas). Cada clave es
 * `MÉTODO /ruta` sin query; el valor es la respuesta, o una función que la calcula o lanza.
 * `jest.mock('@/shared/api/api-mutator')` debe estar en el test que lo use.
 */
export function mockApi(handlers: Readonly<Record<string, unknown>>): void {
  recordedCalls.length = 0;
  jest.mocked(apiMutator).mockReset();
  jest.mocked(apiMutator).mockImplementation((path: string, init: RequestInit) => {
    const method = init.method ?? 'GET';
    const pathWithoutQuery = path.split('?')[0] ?? path;
    const handler = handlers[`${method} ${pathWithoutQuery}`];
    const body = parseRequestBody(init.body);
    recordedCalls.push({ method, path, body });
    if (handler === undefined) {
      return Promise.reject(buildApiError('NOT_FOUND', 404));
    }
    try {
      const response =
        typeof handler === 'function' ? (handler as ApiCallHandler)({ path, body }) : handler;
      return Promise.resolve(response);
    } catch (failure) {
      return Promise.reject(failure instanceof Error ? failure : new Error('mock failure'));
    }
  });
}

export function getRecordedApiCalls(): readonly ApiCall[] {
  return recordedCalls;
}

export function findApiCall(method: string, pathPrefix: string): ApiCall | undefined {
  return recordedCalls.find((call) => call.method === method && call.path.startsWith(pathPrefix));
}
