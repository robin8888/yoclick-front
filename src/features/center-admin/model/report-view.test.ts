import {
  buildStaffReportCsv,
  describeIncomeChange,
  formatReportMonth,
  formatReportPercent,
  scaleToPercent,
} from './report-view';

describe('formatReportMonth', () => {
  it.each([
    ['2026-01', 'ene'],
    ['2026-09', 'sep'],
    ['2026-12', 'dic'],
  ])('writes %s as %s', (monthKey, expected) => {
    expect(formatReportMonth(monthKey)).toBe(expected);
  });
});

describe('formatReportPercent', () => {
  it.each([
    [78, '78 %'],
    [0, '0 %'],
    [null, '—'],
  ])('writes %s as %s', (percent, expected) => {
    expect(formatReportPercent(percent)).toBe(expected);
  });
});

describe('describeIncomeChange', () => {
  it.each([
    {
      caseName: 'income went up',
      current: 6360,
      previous: 6000,
      expected: { kind: 'up', percent: 6 },
    },
    {
      caseName: 'income went down',
      current: 4500,
      previous: 6000,
      expected: { kind: 'down', percent: 25 },
    },
    { caseName: 'nothing changed', current: 6000, previous: 6000, expected: { kind: 'same' } },
    {
      caseName: 'there was no income before',
      current: 6000,
      previous: 0,
      expected: { kind: 'unknown' },
    },
  ])('detects when $caseName', ({ current, previous, expected }) => {
    expect(describeIncomeChange(current, previous)).toEqual(expected);
  });
});

describe('scaleToPercent', () => {
  it.each([
    [840, 840, 100],
    [420, 840, 50],
    [0, 840, 0],
    [10, 0, 0],
  ])('scales %i against %i as %i', (value, maximum, expected) => {
    expect(scaleToPercent(value, maximum)).toBe(expected);
  });
});

describe('buildStaffReportCsv', () => {
  it('writes a header and a row per person with semicolons and decimal commas', () => {
    const csv = buildStaffReportCsv(
      ['Instructor', 'Citas', 'Horas', 'Ocupación %'],
      [
        { fullName: 'Marta Gil', sessionCount: 12, hours: 9.5, occupancyPercent: 40 },
        { fullName: 'Luis "El Rápido"; Gómez', sessionCount: 3, hours: 3, occupancyPercent: null },
      ],
    );

    expect(csv).toBe(
      '﻿Instructor;Citas;Horas;Ocupación %\nMarta Gil;12;9,5;40\n"Luis ""El Rápido""; Gómez";3;3;',
    );
  });
});
