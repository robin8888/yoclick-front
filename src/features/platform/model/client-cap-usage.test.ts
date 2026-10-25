import { getCapUsage } from './client-cap-usage';

describe('getCapUsage', () => {
  it.each([
    [50, 150, { ratio: 1 / 3, level: 'ok' }],
    [135, 150, { ratio: 0.9, level: 'warning' }],
    [150, 150, { ratio: 1, level: 'full' }],
    [180, 150, { ratio: 1, level: 'full' }],
    [0, 150, { ratio: 0, level: 'ok' }],
    [40, null, null],
    [40, 0, null],
  ] as const)('%i clients of %s gives %j', (clients, cap, expected) => {
    expect(getCapUsage(clients, cap)).toEqual(expected);
  });
});
