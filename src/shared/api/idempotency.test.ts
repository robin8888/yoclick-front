import { createIdempotencyIntention } from './idempotency';

jest.mock('expo-crypto', () => ({ randomUUID: () => '3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6' }));

describe('createIdempotencyIntention', () => {
  it('generates the key with expo-crypto by default (SEC-36)', () => {
    const intention = createIdempotencyIntention();

    expect(intention.key).toBe('3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6');
    expect(intention.headers).toEqual({ 'Idempotency-Key': intention.key });
  });
});
