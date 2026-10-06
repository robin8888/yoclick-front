import { buildHolidayList, isValidHolidayDraft } from './holidays';

const CHRISTMAS = { date: '2026-12-25', label: 'Navidad' };

describe('isValidHolidayDraft', () => {
  it.each([
    ['a valid new day', { date: '2026-12-31', label: 'Nochevieja' }, true],
    ['a day that is already closed', { date: '2026-12-25', label: 'Otra vez' }, false],
    ['a date written the wrong way', { date: '25/12/2026', label: 'Navidad' }, false],
    ['an impossible date', { date: '2026-02-30', label: 'Nunca' }, false],
    ['no reason', { date: '2026-12-31', label: '   ' }, false],
  ])('%s', (_label, draft, isValid) => {
    expect(isValidHolidayDraft(draft, [CHRISTMAS])).toBe(isValid);
  });
});

describe('buildHolidayList', () => {
  it('adds the closure and keeps the list sorted by date', () => {
    expect(buildHolidayList([CHRISTMAS], { date: '2026-01-01', label: ' Año Nuevo ' })).toEqual([
      { date: '2026-01-01', label: 'Año Nuevo' },
      CHRISTMAS,
    ]);
  });
});
