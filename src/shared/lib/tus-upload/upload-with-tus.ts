const TUS_VERSION = '1.0.0';
const BYTES_PER_MEBIBYTE = 1_048_576;
const CHUNK_SIZE_MEBIBYTES = 4;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MEBIBYTES * BYTES_PER_MEBIBYTE;
const MAX_RETRIES_PER_CHUNK = 3;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;

export interface TusUploadRequest {
  /** Dirección de creación de la subida (la firma el servidor de Yoclick). */
  endpoint: string;
  /** Cabeceras de la firma, tal cual las devuelve el servidor. */
  headers: Readonly<Record<string, string>>;
  metadata: Readonly<Record<string, string>>;
  totalBytes: number;
  /** Lee `length` bytes desde `offset`; el fichero nunca se carga entero en memoria. */
  readChunk: (offset: number, length: number) => Uint8Array;
  onProgress: (uploadedBytes: number) => void;
}

interface TusDependencies {
  fetchImplementation?: typeof fetch;
}

/** Lo que necesita cada llamada de una subida ya creada. */
interface TusSession {
  uploadUrl: string;
  request: TusUploadRequest;
  fetchImplementation: typeof fetch;
}

export class TusUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TusUploadError';
  }
}

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

function encodeMetadata(metadata: Readonly<Record<string, string>>): string {
  return Object.entries(metadata)
    .map(([key, value]) => `${key} ${encodeBase64Utf8(value)}`)
    .join(',');
}

async function createUpload(
  request: TusUploadRequest,
  fetchImplementation: typeof fetch,
): Promise<TusSession> {
  const response = await fetchImplementation(request.endpoint, {
    method: 'POST',
    headers: {
      ...request.headers,
      'Tus-Resumable': TUS_VERSION,
      'Upload-Length': String(request.totalBytes),
      'Upload-Metadata': encodeMetadata(request.metadata),
    },
  });
  const location = response.headers.get('Location');
  if (response.status !== HTTP_CREATED || location === null) {
    throw new TusUploadError(`The upload could not be created (${String(response.status)})`);
  }
  return {
    uploadUrl: new URL(location, request.endpoint).toString(),
    request,
    fetchImplementation,
  };
}

async function readServerOffset(session: TusSession): Promise<number> {
  const response = await session.fetchImplementation(session.uploadUrl, {
    method: 'HEAD',
    headers: { ...session.request.headers, 'Tus-Resumable': TUS_VERSION },
  });
  const offset = Number(response.headers.get('Upload-Offset'));
  if (!response.ok || Number.isNaN(offset)) {
    throw new TusUploadError(`The upload offset is unknown (${String(response.status)})`);
  }
  return offset;
}

async function sendChunk(
  session: TusSession,
  chunk: { offset: number; bytes: Uint8Array },
): Promise<number> {
  const response = await session.fetchImplementation(session.uploadUrl, {
    method: 'PATCH',
    headers: {
      ...session.request.headers,
      'Tus-Resumable': TUS_VERSION,
      'Upload-Offset': String(chunk.offset),
      'Content-Type': 'application/offset+octet-stream',
    },
    body: chunk.bytes as BodyInit,
  });
  const newOffset = Number(response.headers.get('Upload-Offset'));
  if (response.status !== HTTP_NO_CONTENT || Number.isNaN(newOffset)) {
    throw new TusUploadError(`A chunk was refused (${String(response.status)})`);
  }
  return newOffset;
}

/** Si un trozo falla, pregunta al servidor hasta dónde llegó y sigue desde ahí en vez de empezar de cero. */
async function sendChunkWithRetries(session: TusSession, offset: number): Promise<number> {
  let currentOffset = offset;
  for (let attempt = 0; ; attempt += 1) {
    const length = Math.min(CHUNK_SIZE_BYTES, session.request.totalBytes - currentOffset);
    try {
      const bytes = session.request.readChunk(currentOffset, length);
      return await sendChunk(session, { offset: currentOffset, bytes });
    } catch (error) {
      if (attempt >= MAX_RETRIES_PER_CHUNK) throw error;
      currentOffset = await readServerOffset(session);
    }
  }
}

/**
 * Sube un fichero grande por el protocolo TUS directamente al servicio de vídeo, a trozos y con
 * reintentos. No hay SDK de Bunny para React Native: este es el mínimo del protocolo.
 */
export async function uploadWithTus(
  request: TusUploadRequest,
  dependencies: TusDependencies = {},
): Promise<void> {
  const session = await createUpload(request, dependencies.fetchImplementation ?? fetch);
  let offset = 0;
  request.onProgress(offset);
  while (offset < request.totalBytes) {
    offset = await sendChunkWithRetries(session, offset);
    request.onProgress(offset);
  }
}
