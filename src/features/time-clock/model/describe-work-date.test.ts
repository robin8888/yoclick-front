import { describeWorkDate } from './describe-work-date';

describe('describeWorkDate', () => {
  it.each([
    { isoDate: '2026-10-05', expected: { weekday: 'lun', dayNumber: '5' } },
    { isoDate: '2026-10-14', expected: { weekday: 'mié', dayNumber: '14' } },
    { isoDate: '2026-10-31', expected: { weekday: 'sáb', dayNumber: '31' } },
    { isoDate: '2026-11-01', expected: { weekday: 'dom', dayNumber: '1' } },
  ])('splits $isoDate', ({ isoDate, expected }) => {
    expect(describeWorkDate(isoDate)).toEqual(expected);
  });
});
