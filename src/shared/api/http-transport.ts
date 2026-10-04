import { NetworkError, parseApiError } from './api-error';

export const MIN_APP_VERSION_HEADER = 'x-min-app-version';
const NO_CONTENT_STATUS = 204;
const FIRST_ERROR_STATUS = 400;

export interface TransportResponse {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
}

export interface HttpTransport {
  /** Lanza `ApiError` si la respuesta no es 2xx y `NetworkError` si no hay respuesta. */
  send: (path: string, init: RequestInit) => Promise<TransportResponse>;
}

export interface HttpTransportConfig {
  baseUrl: string;
  timeoutMs: number;
  fetchImplementation?: typeof fetch;
  onResponseHeaders?: (headers: Headers) => void;
}

async function readJsonBody(response: Response): Promise<unknown> {
  if (response.status === NO_CONTENT_STATUS) return undefined;
  const responseText = await response.text();
  if (responseText === '') return undefined;
  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    // Un 502 de un proxy llega como HTML: se trata como cuerpo desconocido, no como fallo de red.
    return undefined;
  }
}

interface AbortScope {
  signal: AbortSignal;
  didTimeOut: () => boolean;
  dispose: () => void;
}

// AbortSignal.timeout / AbortSignal.any no están garantizados en Hermes: se compone a mano.
function createAbortScope(
  timeoutMs: number,
  callerSignal: AbortSignal | null | undefined,
): AbortScope {
  const controller = new AbortController();
  let hasTimedOut = false;
  const timeoutHandle = setTimeout(() => {
    hasTimedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = (): void => {
    controller.abort();
  };
  if (callerSignal?.aborted === true) controller.abort();
  callerSignal?.addEventListener('abort', abortFromCaller);
  return {
    signal: controller.signal,
    didTimeOut: () => hasTimedOut,
    dispose: () => {
      clearTimeout(timeoutHandle);
      callerSignal?.removeEventListener('abort', abortFromCaller);
    },
  };
}

export function createHttpTransport(config: HttpTransportConfig): HttpTransport {
  const { baseUrl, timeoutMs, onResponseHeaders } = config;
  const fetchImplementation = config.fetchImplementation ?? fetch;

  async function send(path: string, init: RequestInit): Promise<TransportResponse> {
    const abortScope = createAbortScope(timeoutMs, init.signal);
    try {
      const response = await fetchImplementation(`${baseUrl}${path}`, {
        ...init,
        signal: abortScope.signal,
      });
      onResponseHeaders?.(response.headers);
      const body = await readJsonBody(response);
      if (response.status >= FIRST_ERROR_STATUS) {
        throw parseApiError({
          status: response.status,
          body,
          retryAfterHeader: response.headers.get('retry-after'),
        });
      }
      return { status: response.status, headers: response.headers, body };
    } catch (failure) {
      if (init.signal?.aborted === true) throw failure;
      if (abortScope.didTimeOut()) throw new NetworkError('timeout');
      if (failure instanceof TypeError) throw new NetworkError('offline');
      throw failure;
    } finally {
      abortScope.dispose();
    }
  }

  return { send };
}
