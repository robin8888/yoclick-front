import { getCenterAttention } from './center-attention';

const NOW = new Date('2026-10-21T10:00:00.000Z');
const HEALTHY = {
  status: 'active',
  trialEndsAt: null,
  maxClients: 150,
  activeClientCount: 40,
} as const;

describe('getCenterAttention', () => {
  it.each([
    { caseName: 'a healthy active center', center: HEALTHY, expected: null },
    {
      caseName: 'a suspended center',
      center: { ...HEALTHY, status: 'suspended' },
      expected: 'suspended',
    },
    {
      caseName: 'a center in grace',
      center: { ...HEALTHY, status: 'past_due' },
      expected: 'past-due',
    },
    {
      caseName: 'a center over its client cap',
      center: { ...HEALTHY, activeClientCount: 151 },
      expected: 'over-limit',
    },
    {
      caseName: 'a center exactly at its cap',
      center: { ...HEALTHY, activeClientCount: 150 },
      expected: null,
    },
    {
      caseName: 'a center without cap',
      center: { ...HEALTHY, maxClients: null, activeClientCount: 9000 },
      expected: null,
    },
    {
      caseName: 'a trial ending within a week',
      center: { ...HEALTHY, status: 'trial', trialEndsAt: '2026-10-25T10:00:00.000Z' },
      expected: 'trial-ending',
    },
    {
      caseName: 'a trial with time left',
      center: { ...HEALTHY, status: 'trial', trialEndsAt: '2026-11-10T10:00:00.000Z' },
      expected: null,
    },
    {
      caseName: 'a trial that is already over',
      center: { ...HEALTHY, status: 'trial', trialEndsAt: '2026-10-01T10:00:00.000Z' },
      expected: 'trial-ending',
    },
    {
      caseName: 'suspended before anything else',
      center: { ...HEALTHY, status: 'suspended', activeClientCount: 999 },
      expected: 'suspended',
    },
  ] as const)('$caseName', ({ center, expected }) => {
    expect(getCenterAttention(center, NOW)).toBe(expected);
  });
});
