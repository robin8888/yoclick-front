import {
  buildRealtimeUrl,
  computeReconnectDelayMs,
  realtimeEventSchema,
} from './realtime-protocol';

describe('buildRealtimeUrl', () => {
  it.each([
    ['https://api.yoclick.app', 'wss://api.yoclick.app/v1/realtime'],
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- la API local de desarrollo no tiene TLS
    ['http://192.168.1.20:3000', 'ws://192.168.1.20:3000/v1/realtime'],
  ])('turns %s into %s', (apiBaseUrl, expected) => {
    expect(buildRealtimeUrl(apiBaseUrl)).toBe(expected);
  });
});

describe('computeReconnectDelayMs', () => {
  it.each([
    [0, 1_000],
    [1, 2_000],
    [3, 8_000],
    [5, 30_000],
    [20, 30_000],
  ])('waits for attempt %i', (attempt, expected) => {
    expect(computeReconnectDelayMs(attempt)).toBe(expected);
  });
});

describe('realtimeEventSchema', () => {
  it('accepts what the server sends', () => {
    expect(realtimeEventSchema.safeParse({ type: 'ready' }).success).toBe(true);
    expect(
      realtimeEventSchema.safeParse({ type: 'chat.updated', conversationId: null }).success,
    ).toBe(true);
  });

  it('ignores anything else', () => {
    expect(realtimeEventSchema.safeParse({ type: 'other' }).success).toBe(false);
    expect(realtimeEventSchema.safeParse('hola').success).toBe(false);
  });
});
