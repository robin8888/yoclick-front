// Servidor falso para tests del cliente: guarda cada petición recibida y responde con un guion.
// Se inyecta como `fetchImplementation`; no toca la red ni el `fetch` global.

export interface RecordedRequest {
  readonly url: string;
  readonly path: string;
  readonly method: string;
  readonly headers: Headers;
  readonly body: unknown;
}

export interface FakeReply {
  readonly status: number;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  /** La respuesta no se entrega hasta que esta promesa se resuelve. */
  readonly delayUntil?: Promise<void>;
}

export type FakeRoute = (request: RecordedRequest) => FakeReply | Promise<FakeReply>;

export interface FakeFetch {
  readonly fetchImplementation: typeof fetch;
  readonly requests: RecordedRequest[];
  requestsTo: (path: string) => RecordedRequest[];
}

function toRecordedRequest(url: string, init: RequestInit | undefined): RecordedRequest {
  const parsedUrl = new URL(url);
  const rawBody = init?.body;
  return {
    url,
    path: parsedUrl.pathname,
    method: init?.method ?? 'GET',
    headers: new Headers(init?.headers),
    body: typeof rawBody === 'string' ? (JSON.parse(rawBody) as unknown) : undefined,
  };
}

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  return input instanceof URL ? input.href : input.url;
}

function toResponse(reply: FakeReply): Response {
  const hasBody = reply.body !== undefined;
  return new Response(hasBody ? JSON.stringify(reply.body) : null, {
    status: reply.status,
    headers: { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...reply.headers },
  });
}

export function createFakeFetch(routes: Record<string, FakeRoute>): FakeFetch {
  const requests: RecordedRequest[] = [];
  const fetchImplementation = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = toRecordedRequest(resolveRequestUrl(input), init);
    requests.push(request);
    const route = routes[request.path];
    if (route === undefined) throw new Error(`Unexpected request to ${request.path}`);
    const reply = await route(request);
    await reply.delayUntil;
    return toResponse(reply);
  }) as typeof fetch;
  return {
    fetchImplementation,
    requests,
    requestsTo: (path) => requests.filter((request) => request.path === path),
  };
}
