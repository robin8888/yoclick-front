import { buildWaitlistStatusLabel } from './waitlist-labels';

const MADRID = 'Europe/Madrid';

describe('buildWaitlistStatusLabel', () => {
  it('says the place in the queue while waiting', () => {
    const label = buildWaitlistStatusLabel(
      { status: 'waiting', position: 2, offerExpiresAt: null },
      MADRID,
    );

    expect(label).toBe('En lista de espera · puesto 2');
  });

  it('says until when the offered seat can be confirmed', () => {
    const label = buildWaitlistStatusLabel(
      { status: 'offered', position: null, offerExpiresAt: '2026-10-22T16:30:00.000Z' },
      MADRID,
    );

    expect(label).toContain('Plaza ofrecida');
    expect(label).toContain('18:30');
  });
});
