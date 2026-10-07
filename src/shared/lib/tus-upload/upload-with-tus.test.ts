import { TusUploadError, uploadWithTus, type TusUploadRequest } from './upload-with-tus';

const CHUNK_SIZE_BYTES = 4 * 1024 * 1024;
const UPLOAD_URL = 'https://video.example/tusupload/abc';

interface RecordedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  byteLength: number;
}

/** Un servidor TUS de mentira que anota lo que recibe y puede fallar en trozos concretos. */
function createFakeTusServer(options: { failingPatchNumbers?: number[] } = {}) {
  const calls: RecordedCall[] = [];
  let receivedBytes = 0;
  let patchCount = 0;
  const failing = new Set(options.failingPatchNumbers ?? []);

  const fetchImplementation = jest.fn((url: string, init: RequestInit) => {
    const method = init.method ?? 'GET';
    const body = init.body as Uint8Array | undefined;
    calls.push({
      url,
      method,
      headers: init.headers as Record<string, string>,
      byteLength: body?.byteLength ?? 0,
    });
    if (method === 'POST') {
      return Promise.resolve(
        new Response(null, { status: 201, headers: { Location: '/tusupload/abc' } }),
      );
    }
    if (method === 'HEAD') {
      return Promise.resolve(
        new Response(null, { status: 200, headers: { 'Upload-Offset': String(receivedBytes) } }),
      );
    }
    patchCount += 1;
    if (failing.has(patchCount)) return Promise.reject(new TypeError('Network request failed'));
    receivedBytes += body?.byteLength ?? 0;
    return Promise.resolve(
      new Response(null, { status: 204, headers: { 'Upload-Offset': String(receivedBytes) } }),
    );
  });

  return { calls, fetchImplementation: fetchImplementation as unknown as typeof fetch };
}

function buildRequest(
  totalBytes: number,
  overrides: Partial<TusUploadRequest> = {},
): TusUploadRequest {
  return {
    endpoint: 'https://video.example/tusupload',
    headers: { AuthorizationSignature: 'signature', VideoId: 'video-1' },
    metadata: { filetype: 'video/mp4', title: 'Sentadilla goblet' },
    totalBytes,
    readChunk: (_offset, length) => new Uint8Array(length),
    onProgress: jest.fn(),
    ...overrides,
  };
}

describe('uploadWithTus', () => {
  it('creates the upload with the signature and the encoded metadata', async () => {
    const server = createFakeTusServer();

    await uploadWithTus(buildRequest(1000), { fetchImplementation: server.fetchImplementation });

    const [creation] = server.calls;
    expect(creation).toMatchObject({ method: 'POST', url: 'https://video.example/tusupload' });
    expect(creation?.headers).toMatchObject({
      AuthorizationSignature: 'signature',
      VideoId: 'video-1',
      'Tus-Resumable': '1.0.0',
      'Upload-Length': '1000',
      'Upload-Metadata': `filetype ${btoa('video/mp4')},title ${btoa('Sentadilla goblet')}`,
    });
  });

  it('encodes accents in the metadata as UTF-8', async () => {
    const server = createFakeTusServer();

    await uploadWithTus(buildRequest(10, { metadata: { title: 'Presentación' } }), {
      fetchImplementation: server.fetchImplementation,
    });

    const encoded = server.calls[0]?.headers['Upload-Metadata'] ?? '';
    const bytes = Uint8Array.from(atob(encoded.replace('title ', '')), (char) =>
      char.charCodeAt(0),
    );
    expect(new TextDecoder().decode(bytes)).toBe('Presentación');
  });

  it('sends a small file in one piece and reports the progress', async () => {
    const server = createFakeTusServer();
    const onProgress = jest.fn();

    await uploadWithTus(buildRequest(1000, { onProgress }), {
      fetchImplementation: server.fetchImplementation,
    });

    const patches = server.calls.filter(({ method }) => method === 'PATCH');
    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({ url: UPLOAD_URL, byteLength: 1000 });
    expect(patches[0]?.headers).toMatchObject({
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
    });
    expect(onProgress.mock.calls).toEqual([[0], [1000]]);
  });

  it('splits a big file in chunks and never reads more than a chunk at a time', async () => {
    const server = createFakeTusServer();
    const totalBytes = CHUNK_SIZE_BYTES * 2 + 500;
    const readChunk = jest.fn((_offset: number, length: number) => new Uint8Array(length));

    await uploadWithTus(buildRequest(totalBytes, { readChunk }), {
      fetchImplementation: server.fetchImplementation,
    });

    expect(readChunk.mock.calls).toEqual([
      [0, CHUNK_SIZE_BYTES],
      [CHUNK_SIZE_BYTES, CHUNK_SIZE_BYTES],
      [CHUNK_SIZE_BYTES * 2, 500],
    ]);
  });

  it('asks the server where it was and goes on from there when a chunk fails', async () => {
    const server = createFakeTusServer({ failingPatchNumbers: [2] });
    const totalBytes = CHUNK_SIZE_BYTES * 2;

    await uploadWithTus(buildRequest(totalBytes), {
      fetchImplementation: server.fetchImplementation,
    });

    const methods = server.calls.map(({ method }) => method);
    expect(methods).toEqual(['POST', 'PATCH', 'PATCH', 'HEAD', 'PATCH']);
    const lastPatch = server.calls.at(-1);
    expect(lastPatch?.headers['Upload-Offset']).toBe(String(CHUNK_SIZE_BYTES));
  });

  it('gives up with an error after too many failures', async () => {
    const server = createFakeTusServer({ failingPatchNumbers: [1, 2, 3, 4, 5] });

    await expect(
      uploadWithTus(buildRequest(1000), { fetchImplementation: server.fetchImplementation }),
    ).rejects.toThrow(TypeError);
  });

  it('fails clearly when the service refuses to create the upload', async () => {
    const refusing = jest.fn(() =>
      Promise.resolve(new Response(null, { status: 403 })),
    ) as unknown as typeof fetch;

    await expect(
      uploadWithTus(buildRequest(1000), { fetchImplementation: refusing }),
    ).rejects.toThrow(TusUploadError);
  });
});
