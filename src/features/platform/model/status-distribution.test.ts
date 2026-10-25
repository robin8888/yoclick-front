import { buildStatusShares } from './status-distribution';

describe('buildStatusShares', () => {
  it('orders the states and gives each its share of the total', () => {
    const shares = buildStatusShares({ trial: 2, active: 6, past_due: 1, suspended: 1 });

    expect(shares.map(({ statusId }) => statusId)).toEqual([
      'active',
      'trial',
      'past_due',
      'suspended',
    ]);
    expect(shares.map(({ share }) => share)).toEqual([0.6, 0.2, 0.1, 0.1]);
  });

  it('gives every state a zero share when there are no centers', () => {
    const shares = buildStatusShares({ trial: 0, active: 0, past_due: 0, suspended: 0 });

    expect(shares.every(({ share }) => share === 0)).toBe(true);
  });
});
