import {
  DEFAULT_CENTER_APPEARANCE,
  resolveScreenBackgroundPaint,
  resolveThemeModeForBackground,
  type CenterAppearance,
  type ScreenBackgroundPaint,
} from './center-appearance';

const CASES: readonly [string, CenterAppearance, ScreenBackgroundPaint][] = [
  ['nothing chosen uses the theme', DEFAULT_CENTER_APPEARANCE, { kind: 'theme' }],
  [
    'only a hive color keeps the theme background',
    { ...DEFAULT_CENTER_APPEARANCE, hiveColor: '#F2C94C' },
    { kind: 'theme' },
  ],
  [
    'one color is a solid background',
    { ...DEFAULT_CENTER_APPEARANCE, backgroundColor: '#1B1F3B' },
    { kind: 'solid', color: '#1B1F3B' },
  ],
  [
    'two colors are a gradient',
    { backgroundColor: '#1B1F3B', backgroundColorEnd: '#3A2A6B', hiveColor: null },
    { kind: 'gradient', startColor: '#1B1F3B', endColor: '#3A2A6B' },
  ],
  [
    'an end color without a start color is ignored',
    { backgroundColor: null, backgroundColorEnd: '#3A2A6B', hiveColor: null },
    { kind: 'theme' },
  ],
];

describe('resolveScreenBackgroundPaint', () => {
  it.each(CASES)('%s', (_description, appearance, expectedPaint) => {
    expect(resolveScreenBackgroundPaint(appearance)).toEqual(expectedPaint);
  });
});

describe('resolveThemeModeForBackground', () => {
  const solid = (backgroundColor: string): CenterAppearance => ({
    ...DEFAULT_CENTER_APPEARANCE,
    backgroundColor,
  });

  it.each<[string, CenterAppearance, 'light' | 'dark']>([
    ['a dark background turns a light app dark', solid('#1B1F3B'), 'dark'],
    ['a light background keeps a light app', solid('#FDE9E3'), 'light'],
  ])('%s', (_description, appearance, expectedMode) => {
    expect(resolveThemeModeForBackground(appearance, 'light')).toBe(expectedMode);
  });

  it('keeps the preferred mode without a chosen background', () => {
    expect(resolveThemeModeForBackground(DEFAULT_CENTER_APPEARANCE, 'dark')).toBe('dark');
  });

  it('turns a dark app light over a light background', () => {
    expect(resolveThemeModeForBackground(solid('#FDE9E3'), 'dark')).toBe('light');
  });

  it('judges a gradient by its worst color', () => {
    const gradient: CenterAppearance = {
      backgroundColor: '#FFFFFF',
      backgroundColorEnd: '#C8C8C8',
      hiveColor: null,
    };

    expect(resolveThemeModeForBackground(gradient, 'dark')).toBe('light');
  });
});
