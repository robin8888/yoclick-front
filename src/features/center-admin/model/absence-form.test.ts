import {
  buildAbsenceRequest,
  isValidAbsenceDraft,
  looksLikeIsoDate,
  type AbsenceDraft,
} from './absence-form';

const draft = (overrides: Partial<AbsenceDraft>): AbsenceDraft => ({
  startsOn: '2026-11-23',
  endsOn: '2026-11-27',
  reason: 'vacation',
  ...overrides,
});

describe('isValidAbsenceDraft', () => {
  it.each([
    { caseName: 'a week', input: draft({}), isExpectedValid: true },
    { caseName: 'a single day', input: draft({ endsOn: '2026-11-23' }), isExpectedValid: true },
    {
      caseName: 'an end before the start',
      input: draft({ endsOn: '2026-11-22' }),
      isExpectedValid: false,
    },
    {
      caseName: 'a date that does not exist',
      input: draft({ startsOn: '2026-02-30' }),
      isExpectedValid: false,
    },
    {
      caseName: 'text that is not a date',
      input: draft({ startsOn: '23/11' }),
      isExpectedValid: false,
    },
    {
      caseName: 'an absence of more than a year',
      input: draft({ startsOn: '2026-01-01', endsOn: '2027-06-01' }),
      isExpectedValid: false,
    },
  ])('is $isExpectedValid for $caseName', ({ input, isExpectedValid }) => {
    expect(isValidAbsenceDraft(input)).toBe(isExpectedValid);
  });
});

describe('buildAbsenceRequest', () => {
  it('lasts one day when the end is left empty', () => {
    expect(buildAbsenceRequest(draft({ endsOn: '' }))).toEqual({
      startsOn: '2026-11-23',
      endsOn: '2026-11-23',
      reason: 'vacation',
    });
  });

  it('trims the dates', () => {
    expect(
      buildAbsenceRequest(draft({ startsOn: ' 2026-11-23 ', endsOn: ' 2026-11-24 ' })),
    ).toEqual({
      startsOn: '2026-11-23',
      endsOn: '2026-11-24',
      reason: 'vacation',
    });
  });
});

describe('looksLikeIsoDate', () => {
  it.each([
    ['2026-11-23', true],
    [' 2026-11-23 ', true],
    ['23/11/2026', false],
    ['', false],
  ])('«%s» is %s', (text, isDate) => {
    expect(looksLikeIsoDate(text)).toBe(isDate);
  });
});
