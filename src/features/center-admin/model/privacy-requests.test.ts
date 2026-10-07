import { isRequestOverdue } from './privacy-requests';

const NOW = new Date('2026-10-26T00:00:00.000Z');

describe('isRequestOverdue', () => {
  it.each([
    {
      caseName: 'open and past its date',
      status: 'open',
      dueAt: '2026-10-25T00:00:00.000Z',
      isOverdue: true,
    },
    {
      caseName: 'open and still in time',
      status: 'open',
      dueAt: '2026-10-27T00:00:00.000Z',
      isOverdue: false,
    },
    {
      caseName: 'completed after its date',
      status: 'completed',
      dueAt: '2026-10-25T00:00:00.000Z',
      isOverdue: false,
    },
    {
      caseName: 'rejected after its date',
      status: 'rejected',
      dueAt: '2026-10-25T00:00:00.000Z',
      isOverdue: false,
    },
  ])('says $isOverdue for $caseName', ({ status, dueAt, isOverdue }) => {
    expect(isRequestOverdue({ status, dueAt }, NOW)).toBe(isOverdue);
  });
});
