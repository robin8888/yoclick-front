import { summarizeOpeningHours } from './opening-hours-summary';

const EMPTY_WEEK = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

describe('summarizeOpeningHours', () => {
  it('lists the seven days from Monday, closed when there are no ranges', () => {
    const rows = summarizeOpeningHours({
      ...EMPTY_WEEK,
      mon: [{ opensAt: '07:00', closesAt: '21:00' }],
    });

    expect(rows.map((row) => row.day)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    expect(rows[0]?.rangesLabel).toBe('07:00–21:00');
    expect(rows[1]?.rangesLabel).toBeNull();
  });

  it('joins split shifts', () => {
    const rows = summarizeOpeningHours({
      ...EMPTY_WEEK,
      sat: [
        { opensAt: '09:00', closesAt: '14:00' },
        { opensAt: '16:00', closesAt: '20:00' },
      ],
    });

    expect(rows[5]?.rangesLabel).toBe('09:00–14:00 y 16:00–20:00');
  });

  it('treats a center without a schedule as closed every day', () => {
    expect(summarizeOpeningHours(null).every((row) => row.rangesLabel === null)).toBe(true);
  });
});
