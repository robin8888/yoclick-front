import {
  CLOSE_UNAUTHENTICATED,
  computeReconnectDelayMs,
  realtimeEventSchema,
  type RealtimeEvent,
} from './realtime-protocol';

/** Lo único que se usa de un WebSocket: así se prueba sin red. */
export interface SocketLike {
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: { code: number }) => void) | null;
  onerror: (() => void) | null;
  send: (data: string) => void;
  close: () => void;
}

export interface RealtimeConnectionOptions {
  url: string;
  centerId: string;
  /**
   * El access token con el que identificarse, o `null` si ya no hay sesión. Con `shouldRenew` el
   * anterior fue rechazado por caducado: hay que pedir uno nuevo.
   */
  getAccessToken: (request: { shouldRenew: boolean }) => Promise<string | null>;
  onEvent: (event: RealtimeEvent) => void;
  onConnectedChange: (isConnected: boolean) => void;
  createSocket?: (url: string) => SocketLike;
  setTimer?: (callback: () => void, delayMs: number) => () => void;
}

export interface RealtimeConnection {
  close: () => void;
}

function defaultSetTimer(callback: () => void, delayMs: number): () => void {
  const handle = setTimeout(callback, delayMs);
  return () => {
    clearTimeout(handle);
  };
}

/** Lo que se hace con un mensaje del servidor: `ready` marca la conexión y el resto va a quien escucha. */
function parseServerEvent(rawMessage: unknown): RealtimeEvent | null {
  if (typeof rawMessage !== 'string') return null;
  try {
    const parsed = realtimeEventSchema.safeParse(JSON.parse(rawMessage));
    return parsed.success ? parsed.data : null;
  } catch {
    // Un mensaje que no es JSON no es nuestro: se ignora.
    return null;
  }
}

/**
 * Mantiene abierto el WebSocket del tiempo real: se identifica con el primer mensaje (el token no
 * va en la URL), avisa de cada evento y, si se cae o el servidor lo cierra al caducar el token,
 * vuelve a conectar con espera creciente. `close()` lo deja cerrado para siempre.
 */
class RealtimeSession implements RealtimeConnection {
  private isClosed = false;
  private attempt = 0;
  private socket: SocketLike | null = null;
  private cancelRetry: (() => void) | null = null;
  private shouldRenewToken = false;
  private readonly createSocket: (url: string) => SocketLike;
  private readonly setTimer: (callback: () => void, delayMs: number) => () => void;

  constructor(private readonly options: RealtimeConnectionOptions) {
    this.createSocket = options.createSocket ?? ((url) => new WebSocket(url) as SocketLike);
    this.setTimer = options.setTimer ?? defaultSetTimer;
    this.connect();
  }

  close = (): void => {
    this.isClosed = true;
    this.cancelRetry?.();
    this.socket?.close();
    this.options.onConnectedChange(false);
  };

  private connect = (): void => {
    if (this.isClosed) return;
    const current = this.createSocket(this.options.url);
    this.socket = current;
    current.onopen = () => {
      void this.identify(current);
    };
    current.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    current.onclose = (event) => {
      this.handleClose(event.code);
    };
    current.onerror = () => {
      current.close();
    };
  };

  private async identify(current: SocketLike): Promise<void> {
    const accessToken = await this.options.getAccessToken({ shouldRenew: this.shouldRenewToken });
    this.shouldRenewToken = false;
    if (this.isClosed || accessToken === null) {
      current.close();
      return;
    }
    current.send(JSON.stringify({ type: 'auth', accessToken, centerId: this.options.centerId }));
  }

  private handleMessage(rawMessage: unknown): void {
    const event = parseServerEvent(rawMessage);
    if (event === null) return;
    if (event.type === 'ready') {
      this.attempt = 0;
      this.options.onConnectedChange(true);
      return;
    }
    this.options.onEvent(event);
  }

  private handleClose(code: number): void {
    this.options.onConnectedChange(false);
    if (this.isClosed) return;
    // Un token caducado se renueva y se reconecta ya; el resto, con espera creciente.
    if (code === CLOSE_UNAUTHENTICATED) {
      this.shouldRenewToken = true;
      this.cancelRetry = this.setTimer(this.connect, 0);
      return;
    }
    this.cancelRetry = this.setTimer(this.connect, computeReconnectDelayMs(this.attempt));
    this.attempt += 1;
  }
}

export function createRealtimeConnection(options: RealtimeConnectionOptions): RealtimeConnection {
  return new RealtimeSession(options);
}
