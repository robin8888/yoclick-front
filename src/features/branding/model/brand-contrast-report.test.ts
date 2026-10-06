import {
  buildBrandContrastReport,
  classifyContrastRatio,
  formatContrastRatio,
} from './brand-contrast-report';

describe('classifyContrastRatio', () => {
  it.each([
    [7, 'aa'],
    [4.5, 'aa'],
    [4.49, 'large-text-only'],
    [3, 'large-text-only'],
    [2.9, 'fail'],
  ])('%s is %s', (ratio, expectedLevel) => {
    expect(classifyContrastRatio(ratio)).toBe(expectedLevel);
  });
});

describe('formatContrastRatio', () => {
  it('uses a decimal comma', () => {
    expect(formatContrastRatio(7.24)).toBe('7,2:1');
  });
});

describe('buildBrandContrastReport', () => {
  it.each(['#E4572E', '#2446C7', '#C8F031', '#0E8A6E', '#7A3FE0', '#D6336C', '#111315', '#F2B705'])(
    'text used as brand ink passes AA for %s in light and dark',
    (brandHexColor) => {
      const report = buildBrandContrastReport(brandHexColor);

      expect(report.rows.map((row) => row.id)).toEqual(['on-button', 'ink-light', 'ink-dark']);
      expect(report.rows.find((row) => row.id === 'ink-light')?.level).toBe('aa');
      expect(report.rows.find((row) => row.id === 'ink-dark')?.level).toBe('aa');
    },
  );

  it('says the ink was adjusted when the brand color is too light to be text', () => {
    expect(buildBrandContrastReport('#C8F031').wasInkAdjusted).toBe(true);
  });
});
