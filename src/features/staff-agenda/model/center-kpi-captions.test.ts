import { formatOccupancyLabel } from './center-kpi-captions';

describe('formatOccupancyLabel', () => {
  it.each([
    [78, '78 %'],
    [0, '0 %'],
    [null, '—'],
    [undefined, '—'],
  ])('formats %s as %s', (occupancyPercent, expectedLabel) => {
    expect(formatOccupancyLabel(occupancyPercent)).toBe(expectedLabel);
  });
});
