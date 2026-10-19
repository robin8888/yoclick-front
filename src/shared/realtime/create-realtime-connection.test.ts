import { createRealtimeConnection, type SocketLike } from './create-realtime-connection';
import type { RealtimeEvent } from './realtime-protocol';

class FakeSocket implements SocketLike {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  sent: string[] = [];
  isClosed = false;
  send = (message: string): void => {
    this.sent.push(message);
  };
  close = (): void => {
    this.isClosed = true;
  };
}

interface Harness {
  sockets: FakeSocket[];
  events: RealtimeEvent[];
  connectedChanges: boolean[];
  retryDelays: number[];
  runRetry: () => void;
  connection: ReturnType<typeof createRealtimeConnection>;
}

function build(
  getAccessToken: (request: { shouldRenew: boolean }) => Promise<string | null> = () =>
    Promise.resolve('token'),
): Harness {
  const sockets: FakeSocket[] = [];
  const events: RealtimeEvent[] = [];
  const connectedChanges: boolean[] = [];
  const retryDelays: number[] = [];
  let pendingRetry: (() => void) | null = null;
  const connection = createRealtimeConnection({
    url: 'wss://api.test/v1/realtime',
    centerId: 'center-1',
    getAccessToken,
    onEvent: (event) => events.push(event),
    onConnectedChange: (isConnected) => connectedChanges.push(isConnected),
    createSocket: () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      return socket;
    },
    setTimer: (callback, delayMs) => {
      retryDelays.push(delayMs);
      pendingRetry = callback;
      return () => {
        pendingRetry = null;
      };
    },
  });
  return {
    sockets,
    events,
    connectedChanges,
    retryDelays,
    runRetry: () => pendingRetry?.(),
    connection,
  };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('createRealtimeConnection', () => {
  it('identifies with the first message, and not in the URL', async () => {
    const harness = build();
    harness.sockets[0]?.onopen?.();
    await flush();

    expect(harness.sockets[0]?.sent).toEqual([
      JSON.stringify({ type: 'auth', accessToken: 'token', centerId: 'center-1' }),
    ]);
  });

  it('reports connected on ready and passes every event on', () => {
    const harness = build();
    const socket = harness.sockets[0];

    socket?.onmessage?.({ data: JSON.stringify({ type: 'ready' }) });
    socket?.onmessage?.({
      data: JSON.stringify({ type: 'chat.updated', conversationId: 'conversation-1' }),
    });

    expect(harness.connectedChanges).toEqual([true]);
    expect(harness.events).toEqual([{ type: 'chat.updated', conversationId: 'conversation-1' }]);
  });

  it('ignores messages that are not ours', () => {
    const harness = build();

    harness.sockets[0]?.onmessage?.({ data: 'hola' });
    harness.sockets[0]?.onmessage?.({ data: JSON.stringify({ type: 'something' }) });

    expect(harness.events).toEqual([]);
  });

  it('reconnects with a growing wait after the connection drops', () => {
    const harness = build();

    harness.sockets[0]?.onclose?.({ code: 1006 });
    harness.runRetry();
    harness.sockets[1]?.onclose?.({ code: 1006 });

    expect(harness.retryDelays).toEqual([1_000, 2_000]);
    expect(harness.sockets).toHaveLength(2);
  });

  it('starts over with a short wait once it is ready again', () => {
    const harness = build();
    harness.sockets[0]?.onclose?.({ code: 1006 });
    harness.runRetry();

    harness.sockets[1]?.onmessage?.({ data: JSON.stringify({ type: 'ready' }) });
    harness.sockets[1]?.onclose?.({ code: 1006 });

    expect(harness.retryDelays).toEqual([1_000, 1_000]);
  });

  it('reconnects at once, with a fresh token, when the server closes for an expired token', () => {
    const harness = build();

    harness.sockets[0]?.onclose?.({ code: 4401 });

    expect(harness.retryDelays).toEqual([0]);
  });

  it('closes for good, without retrying, when asked to', () => {
    const harness = build();

    harness.connection.close();
    harness.sockets[0]?.onclose?.({ code: 1000 });

    expect(harness.sockets[0]?.isClosed).toBe(true);
    expect(harness.retryDelays).toEqual([]);
  });

  it('closes the socket when there is no session to identify with', async () => {
    const harness = build(() => Promise.resolve(null));

    harness.sockets[0]?.onopen?.();
    await flush();

    expect(harness.sockets[0]?.isClosed).toBe(true);
    expect(harness.sockets[0]?.sent).toEqual([]);
  });

  it('asks for a renewed token when the last one was rejected as expired', async () => {
    const requests: boolean[] = [];
    const harness = build((request) => {
      requests.push(request.shouldRenew);
      return Promise.resolve('token');
    });
    harness.sockets[0]?.onopen?.();
    await flush();

    harness.sockets[0]?.onclose?.({ code: 4401 });
    harness.runRetry();
    harness.sockets[1]?.onopen?.();
    await flush();

    expect(requests).toEqual([false, true]);
  });
});
